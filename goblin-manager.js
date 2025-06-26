const axios = require('axios');
const logger = require('./logger');

class GoblinManager {
    constructor(config) {
        this.config = config;
        this.baseUrl = 'https://www.goblin.meme/api';
        
        // Setup axios instance with cookie
        this.api = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Cookie': this.config.cookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Referer': 'https://www.goblin.meme/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            },
            timeout: 30000
        });
        
        // Add request interceptor for logging
        this.api.interceptors.request.use(
            (config) => {
                logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                logger.error('Request error:', error.message);
                return Promise.reject(error);
            }
        );
        
        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => {
                logger.debug(`Response received: ${response.status} from ${response.config.url}`);
                return response;
            },
            (error) => {
                if (error.response) {
                    logger.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
                    logger.error('Response data:', error.response.data);
                } else if (error.request) {
                    logger.error('Network error - no response received');
                } else {
                    logger.error('Request setup error:', error.message);
                }
                return Promise.reject(error);
            }
        );
    }
    
    /**
     * Get all available boxes
     */
    async getAllBoxes() {
        try {
            logger.debug('Fetching all boxes...');
            const response = await this.api.get('/box');
            
            if (response.data && response.data.boxes) {
                return response.data.boxes.filter(box => box.active);
            }
            return [];
        } catch (error) {
            logger.error('Failed to fetch boxes data:', error.message);
            throw error;
        }
    }
    
    /**
     * Get box detail status
     */
    async getBoxStatus(boxId) {
        try {
            logger.debug(`Fetching box status for ID: ${boxId}`);
            const response = await this.api.get(`/box/${boxId}`);
            return response.data;
        } catch (error) {
            logger.error(`Failed to fetch box status ${boxId}:`, error.message);
            throw error;
        }
    }
    
    /**
     * Start the box
     */
    async startBox(boxId) {
        try {
            logger.debug(`Starting box ID: ${boxId}`);
            const response = await this.api.post(`/box/${boxId}/start`);
            
            if (response.status === 200 || response.status === 201) {
                const data = response.data;
                return {
                    success: true,
                    message: 'Box started successfully',
                    readyAt: data.readyAt,
                    data: data
                };
            } else {
                return {
                    success: false,
                    message: `Unexpected response status: ${response.status}`
                };
            }
        } catch (error) {
            logger.error(`Failed to start box ${boxId}:`, error.message);
            
            // Parse error response
            let errorMessage = error.message;
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }
    
    /**
     * Open the box
     */
    async openBox(boxId) {
        try {
            logger.debug(`Opening box ID: ${boxId}`);
            
            // Try possible endpoints for opening a box
            // Since documentation is unclear, try several possibilities
            const possibleEndpoints = [
                `/box/${boxId}/open`,
                `/box/${boxId}/claim`,
                `/box/${boxId}/collect`
            ];
            
            let lastError;
            for (const endpoint of possibleEndpoints) {
                try {
                    const response = await this.api.post(endpoint);
                    
                    if (response.status === 200 || response.status === 201) {
                        const data = response.data;
                        return {
                            success: true,
                            message: 'Box opened successfully',
                            reward: data.reward || data.prize || 'Unknown reward',
                            data: data
                        };
                    }
                } catch (error) {
                    lastError = error;
                    // Try next endpoint
                    continue;
                }
            }
            
            // If all endpoints failed
            throw lastError;
            
        } catch (error) {
            logger.error(`Failed to open box ${boxId}:`, error.message);
            
            // Parse error response
            let errorMessage = error.message;
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
            }
            
            return {
                success: false,
                message: errorMessage
            };
        }
    }
    
    /**
     * Check if cookie is still valid
     */
    async validateCookie() {
        try {
            logger.debug('Validating cookie...');
            const response = await this.api.get('/box');
            return response.status === 200;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                logger.error('Cookie expired or invalid!');
                return false;
            }
            throw error;
        }
    }
    
    /**
     * Get user info or profile (if endpoint exists)
     */
    async getUserInfo() {
        try {
            logger.debug('Getting user info...');
            const possibleEndpoints = ['/user', '/profile', '/me'];
            
            for (const endpoint of possibleEndpoints) {
                try {
                    const response = await this.api.get(endpoint);
                    return response.data;
                } catch (error) {
                    // Try next endpoint
                    continue;
                }
            }
            
            return null;
        } catch (error) {
            logger.error('Failed to fetch user info:', error.message);
            return null;
        }
    }
}

module.exports = GoblinManager;
