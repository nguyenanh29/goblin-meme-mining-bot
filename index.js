#!/usr/bin/env node

const cron = require('node-cron');
const GoblinManager = require('./goblin-manager');
const logger = require('./logger');
const config = require('./config');

// Initialize goblin manager
const goblinManager = new GoblinManager(config);

/**
 * Main function to run the goblin box automation
 */
async function runGoblinAutomation() {
    logger.info('=== STARTING GOBLIN BOX AUTOMATION ===');
    
    try {
        // Check all available boxes
        const boxes = await goblinManager.getAllBoxes();
        logger.info(`Found ${boxes.length} available boxes`);
        
        // Process each box
        for (const box of boxes) {
            await processBox(box);
            // Wait a moment between processing boxes
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        logger.info('=== FINISHED GOBLIN BOX AUTOMATION ===');
    } catch (error) {
        logger.error('Failed to run automation:', error.message);
    }
}

/**
 * Process individual box
 */
async function processBox(box) {
    try {
        logger.info(`\n--- CHECKING BOX: ${box.name} ---`);
        
        // Get detailed box status
        const boxStatus = await goblinManager.getBoxStatus(box._id);
        
        // Log box status
        logger.info(`Box Type: ${boxStatus.boxType}`);
        logger.info(`Normal Prize: ${boxStatus.normalPrize}`);
        logger.info(`Mission Completed: ${boxStatus.missionCompleted}`);
        logger.info(`Has Box: ${boxStatus.hasBox}`);
        logger.info(`Is Ready: ${boxStatus.isReady}`);
        logger.info(`Opened: ${boxStatus.opened}`);
        
        // Check if box is ready to be opened
        if (boxStatus.hasBox && boxStatus.isReady && !boxStatus.opened) {
            logger.info('Box is ready, opening...');
            const openResult = await goblinManager.openBox(box._id);
            if (openResult.success) {
                logger.success(`SUCCESS! Box ${box.name} has been opened. Reward: ${openResult.reward}`);
            } else {
                logger.error(`Failed to open box ${box.name}: ${openResult.message}`);
            }
        }
        // Check if box has not been started
        else if (!boxStatus.hasBox && !boxStatus.opened) {
            logger.info('Box has not been started, starting...');
            const startResult = await goblinManager.startBox(box._id);
            if (startResult.success) {
                logger.success(`SUCCESS! Box ${box.name} has been started. Ready at: ${startResult.readyAt}`);
            } else {
                logger.error(`Failed to start box ${box.name}: ${startResult.message}`);
            }
        }
        // Box already opened
        else if (boxStatus.opened) {
            logger.info('Box has already been opened');
        }
        // Box not ready yet
        else if (boxStatus.hasBox && !boxStatus.isReady) {
            const readyTime = new Date(boxStatus.readyAt);
            logger.info(`Box not ready yet. Ready at: ${readyTime.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })}`);
        }
        // Mission not completed yet
        else if (!boxStatus.missionCompleted) {
            logger.warn('Mission not completed yet, you need to finish the mission first');
            if (boxStatus.missionUrl) {
                logger.info(`Mission URL: ${boxStatus.missionUrl}`);
                logger.info(`Mission Desc: ${boxStatus.missionDesc}`);
            }
        }
        
    } catch (error) {
        logger.error(`Error processing box ${box.name}:`, error.message);
    }
}

/**
 * Run automation immediately if called directly
 */
if (require.main === module) {
    logger.info('Running automation immediately...');
    runGoblinAutomation();
}

// Setup cron job for daily run
logger.info('Setting up daily cron job at 9 AM...');
cron.schedule('0 9 * * *', () => {
    logger.info('CRON JOB TRIGGERED - Running daily automation');
    runGoblinAutomation();
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

// Setup additional cron job to check ready boxes every 4 hours
logger.info('Setting up cron job to check ready boxes every 4 hours...');
cron.schedule('0 */4 * * *', async () => {
    logger.info('CRON JOB TRIGGERED - Checking ready boxes');
    
    try {
        const boxes = await goblinManager.getAllBoxes();
        
        for (const box of boxes) {
            const boxStatus = await goblinManager.getBoxStatus(box._id);
            
            // Check boxes that are ready to be opened
            if (boxStatus.hasBox && boxStatus.isReady && !boxStatus.opened) {
                logger.info(`Box ${box.name} is ready to be opened!`);
                const openResult = await goblinManager.openBox(box._id);
                if (openResult.success) {
                    logger.success(`SUCCESS! Box ${box.name} has been opened. Reward: ${openResult.reward}`);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        logger.error('Error checking ready boxes:', error.message);
    }
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

logger.info('Goblin Box Automation is ready! Script will run:');
logger.info('- Every day at 9 AM (full automation)');
logger.info('- Every 4 hours (checking ready boxes)');
logger.info('- Press Ctrl+C to terminate the script');

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('\nShutting down Goblin Box Automation...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('\nShutting down Goblin Box Automation...');
    process.exit(0);
});
