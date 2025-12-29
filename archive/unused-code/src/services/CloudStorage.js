/**
 * CloudStorage - Handles cloud storage operations
 * Currently supports Google Drive, extensible for other providers
 */
import { EventEmitter } from '../utils/EventEmitter.js';

export class CloudStorage extends EventEmitter {
    constructor() {
        super();
        this.provider = null;
        this.isAuthenticated = false;
        this.authCallbacks = new Map();
    }

    /**
     * Initialize cloud storage provider
     * @param {string} provider - Provider name ('googledrive', 'onedrive', etc.)
     * @param {Object} config - Provider configuration
     */
    async initialize(provider, config = {}) {
        try {
            switch (provider.toLowerCase()) {
                case 'googledrive':
                    this.provider = new GoogleDriveProvider(config);
                    break;
                case 'onedrive':
                    this.provider = new OneDriveProvider(config);
                    break;
                default:
                    throw new Error(`Unsupported cloud provider: ${provider}`);
            }
            
            // Setup provider events
            this.provider.on('authenticated', () => {
                this.isAuthenticated = true;
                this.emit('authenticated', { provider });
            });
            
            this.provider.on('authError', (error) => {
                this.isAuthenticated = false;
                this.emit('authError', { provider, error });
            });
            
            this.provider.on('uploadProgress', (progress) => {
                this.emit('uploadProgress', { provider, progress });
            });
            
            this.provider.on('uploadComplete', (data) => {
                this.emit('uploadComplete', { provider, data });
            });
            
            this.provider.on('uploadError', (error) => {
                this.emit('uploadError', { provider, error });
            });
            
            await this.provider.initialize();
            
            this.emit('initialized', { provider });
            
        } catch (error) {
            this.emit('initializationError', { provider, error });
            throw error;
        }
    }

    /**
     * Authenticate with cloud provider
     * @returns {Promise<boolean>} Authentication status
     */
    async authenticate() {
        if (!this.provider) {
            throw new Error('No cloud provider initialized');
        }
        
        return await this.provider.authenticate();
    }

    /**
     * Check if authenticated
     * @returns {boolean} Authentication status
     */
    isLoggedIn() {
        return this.isAuthenticated && this.provider?.isLoggedIn();
    }

    /**
     * Upload file to cloud storage
     * @param {Object} fileData - File data object
     * @returns {Promise<Object>} Upload result
     */
    async uploadFile(fileData) {
        if (!this.provider || !this.isAuthenticated) {
            throw new Error('Not authenticated or no provider');
        }
        
        return await this.provider.uploadFile(fileData);
    }

    /**
     * Download file from cloud storage
     * @param {string} fileId - File ID
     * @returns {Promise<Object>} Download result
     */
    async downloadFile(fileId) {
        if (!this.provider) {
            throw new Error('No cloud provider initialized');
        }
        
        return await this.provider.downloadFile(fileId);
    }

    /**
     * List files in cloud storage
     * @param {Object} options - List options
     * @returns {Promise<Array>} File list
     */
    async listFiles(options = {}) {
        if (!this.provider) {
            throw new Error('No cloud provider initialized');
        }
        
        return await this.provider.listFiles(options);
    }

    /**
     * Delete file from cloud storage
     * @param {string} fileId - File ID
     * @returns {Promise<boolean>} Delete status
     */
    async deleteFile(fileId) {
        if (!this.provider) {
            throw new Error('No cloud provider initialized');
        }
        
        return await this.provider.deleteFile(fileId);
    }

    /**
     * Sign out from cloud provider
     * @returns {Promise<boolean>} Sign out status
     */
    async signOut() {
        if (!this.provider) {
            return false;
        }
        
        const result = await this.provider.signOut();
        if (result) {
            this.isAuthenticated = false;
            this.emit('signedOut', { provider: this.provider.name });
        }
        
        return result;
    }

    /**
     * Get provider information
     * @returns {Object|null} Provider info
     */
    getProviderInfo() {
        if (!this.provider) {
            return null;
        }
        
        return {
            name: this.provider.name,
            version: this.provider.version,
            capabilities: this.provider.capabilities || []
        };
    }
}

/**
 * Google Drive Provider Implementation
 */
class GoogleDriveProvider extends EventEmitter {
    constructor(config) {
        super();
        this.name = 'Google Drive';
        this.config = {
            clientId: config.clientId,
            clientSecret: config.clientSecret || null,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
            redirectUri: config.redirectUri || window.location.origin
        };
        
        this.tokens = {
            accessToken: null,
            refreshToken: null,
            expiry: null
        };
        
        this.apiBase = 'https://www.googleapis.com/drive/v3';
        this.uploadBase = 'https://www.googleapis.com/upload/drive/v3';
    }

    async initialize() {
        this.loadTokensFromStorage();
        
        if (this.tokens.accessToken && !this.isTokenExpired()) {
            this.emit('authenticated');
        }
    }

    async authenticate() {
        try {
            if (this.tokens.refreshToken) {
                return await this.refreshAccessToken();
            }
            
            return await this.startOAuthFlow();
            
        } catch (error) {
            this.emit('authError', error);
            throw error;
        }
    }

    isLoggedIn() {
        return !!(this.tokens.accessToken && !this.isTokenExpired());
    }

    async uploadFile(fileData) {
        const metadata = {
            name: fileData.name,
            parents: ['appDataFolder']
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileData.content], { type: 'text/html' }));
        
        this.emit('uploadProgress', { stage: 'uploading', progress: 0 });
        
        const response = await fetch(`${this.uploadBase}/files?uploadType=multipart`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.tokens.accessToken}`
            },
            body: form
        });
        
        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        this.emit('uploadComplete', { fileId: data.id, fileName: data.name });
        
        return {
            id: data.id,
            name: data.name,
            size: data.size
        };
    }

    async downloadFile(fileId) {
        const response = await fetch(`${this.apiBase}/files/${fileId}?alt=media`, {
            headers: {
                'Authorization': `Bearer ${this.tokens.accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }
        
        return await response.blob();
    }

    async listFiles(options = {}) {
        const params = new URLSearchParams({
            pageSize: options.pageSize || 10,
            fields: 'files(id,name,size,modifiedTime,mimeType)'
        });
        
        const response = await fetch(`${this.apiBase}/files?${params}`, {
            headers: {
                'Authorization': `Bearer ${this.tokens.accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`List files failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return data.files.map(file => ({
            id: file.id,
            name: file.name,
            size: file.size,
            modifiedTime: file.modifiedTime,
            mimeType: file.mimeType
        }));
    }

    async deleteFile(fileId) {
        const response = await fetch(`${this.apiBase}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${this.tokens.accessToken}`
            }
        });
        
        return response.ok;
    }

    async signOut() {
        this.clearTokens();
        this.emit('signedOut');
        return true;
    }

    async startOAuthFlow() {
        const authUrl = this.buildAuthUrl();
        const authWindow = window.open(authUrl, 'google_auth', 'width=500,height=600');
        
        return new Promise((resolve, reject) => {
            const checkClosed = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(checkClosed);
                    reject(new Error('Authentication window closed'));
                }
            }, 1000);
            
            const messageHandler = (event) => {
                if (event.source === authWindow && event.data.type === 'google_auth_success') {
                    clearInterval(checkClosed);
                    authWindow.close();
                    window.removeEventListener('message', messageHandler);
                    
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        this.handleAuthCallback(event.data.code);
                        resolve();
                    }
                }
            };
            
            window.addEventListener('message', messageHandler);
        });
    }

    buildAuthUrl() {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: this.config.scopes.join(' '),
            access_type: 'offline',
            prompt: 'consent'
        });
        
        return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    async handleAuthCallback(code) {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: this.config.redirectUri
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error_description || data.error);
            }
            
            this.tokens = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiry: Date.now() + (data.expires_in * 1000)
            };
            
            this.saveTokensToStorage();
            this.emit('authenticated');
            
        } catch (error) {
            this.emit('authError', error);
            throw error;
        }
    }

    async refreshAccessToken() {
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    refresh_token: this.tokens.refreshToken,
                    grant_type: 'refresh_token'
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error_description || data.error);
            }
            
            this.tokens.accessToken = data.access_token;
            if (data.refresh_token) {
                this.tokens.refreshToken = data.refresh_token;
            }
            this.tokens.expiry = Date.now() + (data.expires_in * 1000);
            
            this.saveTokensToStorage();
            
        } catch (error) {
            this.emit('authError', error);
            throw error;
        }
    }

    isTokenExpired() {
        return !this.tokens.expiry || Date.now() >= this.tokens.expiry;
    }

    loadTokensFromStorage() {
        this.tokens.accessToken = localStorage.getItem('gdrive_access_token');
        this.tokens.refreshToken = localStorage.getItem('gdrive_refresh_token');
        this.tokens.expiry = parseInt(localStorage.getItem('gdrive_token_expiry') || '0');
    }

    saveTokensToStorage() {
        localStorage.setItem('gdrive_access_token', this.tokens.accessToken);
        if (this.tokens.refreshToken) {
            localStorage.setItem('gdrive_refresh_token', this.tokens.refreshToken);
        }
        localStorage.setItem('gdrive_token_expiry', this.tokens.expiry.toString());
    }

    clearTokens() {
        localStorage.removeItem('gdrive_access_token');
        localStorage.removeItem('gdrive_refresh_token');
        localStorage.removeItem('gdrive_token_expiry');
        
        this.tokens = {
            accessToken: null,
            refreshToken: null,
            expiry: null
        };
    }
}

/**
 * OneDrive Provider Implementation (placeholder for future use)
 */
class OneDriveProvider extends EventEmitter {
    constructor(config) {
        super();
        this.name = 'OneDrive';
        // Implementation would go here
    }
    
    async initialize() {
        // Placeholder implementation
    }
    
    async authenticate() {
        // Placeholder implementation
    }
    
    async uploadFile(fileData) {
        // Placeholder implementation
    }
}