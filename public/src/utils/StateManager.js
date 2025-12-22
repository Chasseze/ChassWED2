/**
 * StateManager - Simple state management system
 * Provides centralized state with subscription capabilities
 */
import { EventEmitter } from './EventEmitter.js';

export class StateManager extends EventEmitter {
    constructor(initialState = {}) {
        super();
        
        this.state = { ...initialState };
        this.reducers = new Map();
        this.middleware = [];
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
    }

    /**
     * Register a reducer for state updates
     * @param {string} key - State key
     * @param {Function} reducer - Reducer function
     */
    registerReducer(key, reducer) {
        this.reducers.set(key, reducer);
    }

    /**
     * Register middleware for state updates
     * @param {Function} middleware - Middleware function
     */
    use(middleware) {
        this.middleware.push(middleware);
    }

    /**
     * Get current state
     * @param {string} key - State key (optional)
     * @returns {*} State value
     */
    getState(key = null) {
        if (key) {
            return this.state[key];
        }
        return { ...this.state };
    }

    /**
     * Dispatch state update
     * @param {Object} action - Action object
     */
    dispatch(action) {
        try {
            // Create previous state snapshot
            const prevState = { ...this.state };
            
            // Apply middleware
            let finalAction = action;
            for (const middleware of this.middleware) {
                finalAction = middleware(finalAction, this.state);
            }
            
            // Apply reducers
            if (this.reducers.has(finalAction.type)) {
                const reducer = this.reducers.get(finalAction.type);
                const newState = reducer(this.state, finalAction);
                
                if (newState !== this.state) {
                    // Save to history
                    this.saveToHistory(prevState, newState);
                    
                    this.state = newState;
                    
                    // Emit change event
                    this.emit('stateChanged', {
                        type: finalAction.type,
                        payload: finalAction.payload,
                        prevState,
                        nextState: newState,
                        action: finalAction
                    });
                }
            } else {
                console.warn(`No reducer found for action type: ${finalAction.type}`);
            }
            
        } catch (error) {
            this.emit('error', { action, error });
            console.error('State management error:', error);
        }
    }

    /**
     * Batch multiple state updates
     * @param {Array} actions - Array of actions
     */
    batchDispatch(actions) {
        actions.forEach(action => this.dispatch(action));
    }

    /**
     * Subscribe to state changes
     * @param {Function} listener - State change listener
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        const unsubscribe = this.on('stateChanged', listener);
        return unsubscribe;
    }

    /**
     * Subscribe to specific state key changes
     * @param {string} key - State key
     * @param {Function} listener - Key change listener
     * @returns {Function} Unsubscribe function
     */
    subscribeToKey(key, listener) {
        const unsubscribe = this.on('stateChanged', ({ nextState }) => {
            const prevValue = this.state[key];
            const nextValue = nextState[key];
            if (prevValue !== nextValue) {
                listener(key, nextValue, prevValue);
            }
        });
        return unsubscribe;
    }

    /**
     * Get state history
     * @param {number} limit - History limit
     * @returns {Array} State history
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    /**
     * Undo last state change
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const prevState = this.history[this.historyIndex];
            
            this.state = { ...prevState };
            this.emit('stateRestored', { state: this.state, type: 'undo', index: this.historyIndex });
        }
    }

    /**
     * Redo next state change
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const nextState = this.history[this.historyIndex];
            
            this.state = { ...nextState };
            this.emit('stateRestored', { state: this.state, type: 'redo', index: this.historyIndex });
        }
    }

    /**
     * Check if undo is available
     * @returns {boolean} Undo availability
     */
    canUndo() {
        return this.historyIndex > 0;
    }

    /**
     * Check if redo is available
     * @returns {boolean} Redo availability
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }

    /**
     * Reset state to initial value
     * @param {Object} initialState - Initial state
     */
    reset(initialState = {}) {
        this.state = { ...initialState };
        this.history = [];
        this.historyIndex = -1;
        
        this.emit('stateReset', { state: this.state });
    }

    /**
     * Save state to history
     * @param {Object} prevState - Previous state
     * @param {Object} nextState - Next state
     */
    saveToHistory(prevState, nextState) {
        // Only save if state actually changed
        if (JSON.stringify(prevState) !== JSON.stringify(nextState)) {
            this.history = this.history.slice(0, this.historyIndex + 1);
            this.history.push(nextState);
            this.historyIndex++;
            
            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
                this.historyIndex--;
            }
        }
    }

    /**
     * Get state snapshot
     * @param {number} index - History index
     * @returns {Object|null} State snapshot
     */
    getStateSnapshot(index = this.historyIndex) {
        if (index >= 0 && index < this.history.length) {
            return { ...this.history[index] };
        }
        return null;
    }

    /**
     * Persist state to localStorage
     * @param {string} key - Storage key
     */
    persistState(key = 'charles_editor_state') {
        try {
            localStorage.setItem(key, JSON.stringify({
                state: this.state,
                history: this.history,
                historyIndex: this.historyIndex,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Failed to persist state:', error);
        }
    }

    /**
     * Load persisted state from localStorage
     * @param {string} key - Storage key
     * @returns {Object|null} Persisted state
     */
    loadPersistedState(key = 'charles_editor_state') {
        try {
            const persisted = localStorage.getItem(key);
            if (persisted) {
                const data = JSON.parse(persisted);
                this.state = data.state || {};
                this.history = data.history || [];
                this.historyIndex = data.historyIndex || -1;
                
                this.emit('stateLoaded', { 
                    state: this.state, 
                    loaded: true 
                });
                
                return data;
            }
        } catch (error) {
            console.error('Failed to load persisted state:', error);
            return null;
        }
    }

    /**
     * Clear persisted state
     * @param {string} key - Storage key
     */
    clearPersistedState(key = 'charles_editor_state') {
        try {
            localStorage.removeItem(key);
            this.emit('stateCleared');
        } catch (error) {
            console.error('Failed to clear persisted state:', error);
        }
    }

    /**
     * Create action creator
     * @param {string} type - Action type
     * @returns {Function} Action creator function
     */
    createAction(type) {
        return (payload) => ({ type, payload });
    }

    /**
     * Create async action creator
     * @param {string} type - Action type
     * @returns {Function} Async action creator function
     */
    createAsyncAction(type) {
        return (payload) => ({ type, payload, async: true });
    }

    /**
     * Get state statistics
     * @returns {Object} State statistics
     */
    getStatistics() {
        return {
            historySize: this.history.length,
            historyIndex: this.historyIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            stateKeys: Object.keys(this.state).length,
            stateSize: JSON.stringify(this.state).length
        };
    }

    /**
     * Validate state structure
     * @param {Object} schema - State schema
     * @returns {boolean} Validation result
     */
    validateState(schema) {
        try {
            return this.validateObject(this.state, schema);
        } catch (error) {
            console.error('State validation error:', error);
            return false;
        }
    }

    /**
     * Validate object against schema
     * @param {Object} obj - Object to validate
     * @param {Object} schema - Validation schema
     * @returns {boolean} Validation result
     */
    validateObject(obj, schema) {
        for (const [key, rules] of Object.entries(schema)) {
            if (rules.required && !(key in obj)) {
                return false;
            }
            
            if (rules.type && typeof obj[key] !== rules.type) {
                return false;
            }
            
            if (rules.validate && !rules.validate(obj[key])) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Destroy state manager
     */
    destroy() {
        this.removeAllListeners();
        
        this.state = {};
        this.history = [];
        this.historyIndex = -1;
        this.reducers.clear();
        this.middleware = [];
        
        this.emit('destroyed');
    }
}