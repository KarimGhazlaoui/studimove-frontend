import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAdvancedAssignments } from '../hooks/useAssignments';
import { getAssignmentConfig } from '../config/assignmentConfig';

// Actions du reducer
const ASSIGNMENT_ACTIONS = {
  SET_EVENT: 'SET_EVENT',
  SET_CONFIG: 'SET_CONFIG',
  SET_VIEW_MODE: 'SET_VIEW_MODE',
  SET_FILTERS: 'SET_FILTERS',
  SET_SELECTED_CLIENTS: 'SET_SELECTED_CLIENTS',
  SET_SELECTED_ROOMS: 'SET_SELECTED_ROOMS',
  TOGGLE_PANEL: 'TOGGLE_PANEL',
  SET_LOADING: 'SET_LOADING'
};

// État initial
const initialState = {
  // Configuration de l'événement
  eventId: null,
  eventType: 'default',
  eventName: '',
  
  // Configuration des assignations
  config: getAssignmentConfig(),
  
  // Interface utilisateur
  viewMode: 'grid', // 'grid', 'list', 'timeline'
  showUnassignedOnly: false,
  showStatsPanel: true,
  showFiltersPanel: false,
  showHistoryPanel: false,
  
  // Filtres
  filters: {
    clientType: 'all',
    gender: 'all',
    hotel: 'all',
    roomType: 'all',
    status: 'all'
  },
  
  // Sélections
  selectedClients: [],
  selectedRooms: [],
  
  // État global
  loading: false
};

// Reducer
const assignmentReducer = (state, action) => {
  switch (action.type) {
    case ASSIGNMENT_ACTIONS.SET_EVENT:
      return {
        ...state,
        eventId: action.payload.eventId,
        eventType: action.payload.eventType || 'default',
        eventName: action.payload.eventName || '',
        config: getAssignmentConfig(action.payload.eventType)
      };
      
    case ASSIGNMENT_ACTIONS.SET_CONFIG:
      return {
        ...state,
        config: { ...state.config, ...action.payload }
      };
      
    case ASSIGNMENT_ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload
      };
      
    case ASSIGNMENT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
      
    case ASSIGNMENT_ACTIONS.SET_SELECTED_CLIENTS:
      return {
        ...state,
        selectedClients: action.payload
      };
      
    case ASSIGNMENT_ACTIONS.SET_SELECTED_ROOMS:
      return {
        ...state,
        selectedRooms: action.payload
      };
      
    case ASSIGNMENT_ACTIONS.TOGGLE_PANEL:
      return {
        ...state,
        [action.payload]: !state[action.payload]
      };
      
    case ASSIGNMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
      
    default:
      return state;
  }
};

// Création du contexte
const AssignmentContext = createContext();

// Hook pour utiliser le contexte
export const useAssignmentContext = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error('useAssignmentContext must be used within an AssignmentProvider');
  }
  return context;
};

// Provider du contexte
export const AssignmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(assignmentReducer, initialState);
  
  // Hook d'assignations avancées
  const assignments = useAdvancedAssignments(state.eventId, state.eventType, {
    enableHistory: true,
    enableCache: true,
    enableNotifications: true,
    autoSave: false
  });

  // Actions du contexte
  const actions = {
    // Configuration de l'événement
    setEvent: (eventId, eventType = 'default', eventName = '') => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_EVENT,
        payload: { eventId, eventType, eventName }
      });
    },
    
    // Configuration des assignations
    updateConfig: (configUpdates) => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_CONFIG,
        payload: configUpdates
      });
    },
    
    // Interface utilisateur
    setViewMode: (mode) => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_VIEW_MODE,
        payload: mode
      });
    },
    
    setFilters: (filters) => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_FILTERS,
        payload: filters
      });
    },
    
    clearFilters: () => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_FILTERS,
        payload: {
          clientType: 'all',
          gender: 'all',
          hotel: 'all',
          roomType: 'all',
          status: 'all'
        }
      });
    },
    
    // Sélections
    selectClients: (clientIds) => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_SELECTED_CLIENTS,
        payload: Array.isArray(clientIds) ? clientIds : [clientIds]
      });
    },
    
    selectRooms: (roomIds) => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_SELECTED_ROOMS,
        payload: Array.isArray(roomIds) ? roomIds : [roomIds]
      });
    },
    
    clearSelections: () => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_SELECTED_CLIENTS,
        payload: []
      });
      dispatch({
        type: ASSIGNMENT_ACTIONS.SET_SELECTED_ROOMS,
        payload: []
      });
    },
    
    // Panneaux
    toggleStatsPanel: () => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.TOGGLE_PANEL,
        payload: 'showStatsPanel'
      });
    },
    
    toggleFiltersPanel: () => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.TOGGLE_PANEL,
        payload: 'showFiltersPanel'
      });
    },
    
    toggleHistoryPanel: () => {
      dispatch({
        type: ASSIGNMENT_ACTIONS.TOGGLE_PANEL,
        payload: 'showHistoryPanel'
      });
    },
    
    // Actions d'assignation avec gestion d'état
    assignSelectedClients: async (hotelId, roomId) => {
      if (state.selectedClients.length === 0) {
        assignments.addNotification({
          type: 'warning',
          title: 'Aucun client sélectionné',
          message: 'Sélectionnez au moins un client pour l\'assignation'
        });
        return;
      }
      
      dispatch({ type: ASSIGNMENT_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const results = [];
        for (const clientId of state.selectedClients) {
          const result = await assignments.assignClient(clientId, hotelId, roomId);
          results.push(result);
        }
        
        const successful = results.filter(r => r.success).length;
        const failed = results.length - successful;
        
        if (successful > 0) {
          assignments.addNotification({
            type: 'success',
            title: 'Assignation réussie',
            message: `${successful} client(s) assigné(s) avec succès`
          });
        }
        
        if (failed > 0) {
          assignments.addNotification({
            type: 'error',
            title: 'Erreurs d\'assignation',
            message: `${failed} client(s) n'ont pas pu être assignés`
          });
        }
        
        // Effacer la sélection après assignation
        actions.clearSelections();
        
      } catch (error) {
        assignments.addNotification({
          type: 'error',
          title: 'Erreur d\'assignation',
          message: error.message
        });
      } finally {
        dispatch({ type: ASSIGNMENT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    
    // Assignation automatique avec options avancées
    performAutoAssignment: async (options = {}) => {
      dispatch({ type: ASSIGNMENT_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const result = await assignments.autoAssign({
          ...options,
          filters: state.filters,
          config: state.config
        });
        
        return result;
      } finally {
        dispatch({ type: ASSIGNMENT_ACTIONS.SET_LOADING, payload: false });
      }
    },
    
    // Batch operations
    batchAssignByType: async (clientType, targetHotel = null) => {
      const clientsOfType = assignments.clients.filter(c => 
        c.clientType === clientType && 
        !assignments.getAssignedClients().includes(c._id)
      );
      
      if (clientsOfType.length === 0) {
        assignments.addNotification({
          type: 'info',
          title: 'Aucun client à assigner',
          message: `Aucun client de type "${clientType}" non assigné`
        });
        return;
      }
      
      dispatch({ type: ASSIGNMENT_ACTIONS.SET_LOADING, payload: true });
      
      try {
        let assigned = 0;
        
        for (const client of clientsOfType) {
          const suggestions = assignments.getSuggestionsForClient(client._id);
          const bestSuggestion = suggestions.find(s => 
            !targetHotel || s.hotelId === targetHotel
          );
          
          if (bestSuggestion) {
            const result = await assignments.assignClient(
              client._id, 
              bestSuggestion.hotelId, 
              bestSuggestion.roomId
            );
            
            if (result.success) assigned++;
          }
        }
        
        assignments.addNotification({
          type: 'success',
          title: 'Assignation par lot terminée',
          message: `${assigned}/${clientsOfType.length} clients "${clientType}" assignés`
        });
        
      } finally {
        dispatch({ type: ASSIGNMENT_ACTIONS.SET_LOADING, payload: false });
      }
    }
  };

  // Données filtrées
  const getFilteredData = () => {
    let filteredClients = assignments.clients;
    let filteredHotels = assignments.hotels;
    
    // Appliquer les filtres
    if (state.filters.clientType !== 'all') {
      filteredClients = filteredClients.filter(c => c.clientType === state.filters.clientType);
    }
    
    if (state.filters.gender !== 'all') {
      filteredClients = filteredClients.filter(c => c.gender === state.filters.gender);
    }
    
    if (state.filters.hotel !== 'all') {
      filteredHotels = filteredHotels.filter(h => h._id === state.filters.hotel);
    }
    
    if (state.showUnassignedOnly) {
      const assignedClientIds = new Set();
      assignments.assignments.forEach(assignment => {
        assignment.logicalRooms.forEach(room => {
          room.assignedClients.forEach(ac => {
            assignedClientIds.add(ac.clientId._id);
          });
        });
      });
      
      filteredClients = filteredClients.filter(c => !assignedClientIds.has(c._id));
    }
    
    return {
      clients: filteredClients,
      hotels: filteredHotels
    };
  };

  // Statistiques en temps réel
  const getRealtimeStats = () => {
    const filteredData = getFilteredData();
    
    return {
      ...assignments.stats,
      filtered: {
        totalClients: filteredData.clients.length,
        totalHotels: filteredData.hotels.length
      },
      selections: {
        selectedClients: state.selectedClients.length,
        selectedRooms: state.selectedRooms.length
      }
    };
  };

  // Sauvegarde automatique de l'état dans localStorage
  useEffect(() => {
    if (state.eventId) {
      const stateToSave = {
        viewMode: state.viewMode,
        filters: state.filters,
        showStatsPanel: state.showStatsPanel,
        showFiltersPanel: state.showFiltersPanel
      };
      
      localStorage.setItem(`assignment_ui_${state.eventId}`, JSON.stringify(stateToSave));
    }
  }, [state.eventId, state.viewMode, state.filters, state.showStatsPanel, state.showFiltersPanel]);

  // Chargement de l'état depuis localStorage
  useEffect(() => {
    if (state.eventId) {
      try {
        const saved = localStorage.getItem(`assignment_ui_${state.eventId}`);
        if (saved) {
          const savedState = JSON.parse(saved);
          
          dispatch({
            type: ASSIGNMENT_ACTIONS.SET_VIEW_MODE,
            payload: savedState.viewMode || 'grid'
          });
          
          dispatch({
            type: ASSIGNMENT_ACTIONS.SET_FILTERS,
            payload: savedState.filters || {}
          });
          
          if (savedState.showStatsPanel !== undefined) {
            dispatch({
              type: ASSIGNMENT_ACTIONS.TOGGLE_PANEL,
              payload: 'showStatsPanel'
            });
          }
        }
      } catch (error) {
        console.warn('Erreur lors du chargement de l\'état UI:', error);
      }
    }
  }, [state.eventId]);

  // Valeur du contexte
  const contextValue = {
    // État
    ...state,
    
    // Données des assignations
    ...assignments,
    
    // Actions
    ...actions,
    
    // Données filtrées
    filteredData: getFilteredData(),
    
    // Statistiques
    realtimeStats: getRealtimeStats(),
    
    // Utilitaires
    isClientSelected: (clientId) => state.selectedClients.includes(clientId),
    isRoomSelected: (roomId) => state.selectedRooms.includes(roomId),
    
    // État de l'interface
    isLoading: state.loading || assignments.loading,
    isSaving: assignments.saving,
    
    // Validation
    hasErrors: assignments.validation?.criticalIssues > 0,
    hasWarnings: assignments.validation?.warnings.length > 0
  };

  return (
    <AssignmentContext.Provider value={contextValue}>
      {children}
    </AssignmentContext.Provider>
  );
};

// HOC pour injecter le contexte
export const withAssignmentContext = (Component) => {
  return function WrappedComponent(props) {
    return (
      <AssignmentProvider>
        <Component {...props} />
      </AssignmentProvider>
    );
  };
};

// Hook pour les actions rapides
export const useQuickActions = () => {
  const context = useAssignmentContext();
  
  return {
    // Actions rapides d'assignation
    quickAssignVIPs: () => context.batchAssignByType('VIP'),
    quickAssignInfluencers: () => context.batchAssignByType('Influenceur'),
    quickAssignStaff: () => context.batchAssignByType('Staff'),
    
    // Actions de vue
    showOnlyUnassigned: () => context.setFilters({ ...context.filters, status: 'unassigned' }),
    showOnlyProblems: () => {
      // Afficher seulement les clients avec des problèmes d'assignation
      const problemClients = context.validation.errors.map(e => e.clientId).filter(Boolean);
      context.selectClients(problemClients);
    },
    
    // Actions de sélection
    selectAllUnassigned: () => {
      const unassigned = context.getUnassignedClients().map(c => c._id);
      context.selectClients(unassigned);
    },
    
    selectByType: (type) => {
      const ofType = context.filteredData.clients
        .filter(c => c.clientType === type)
        .map(c => c._id);
      context.selectClients(ofType);
    },
    
    // Actions d'optimisation
    optimizeSelection: async () => {
      if (context.selectedClients.length === 0) {
        context.addNotification({
          type: 'warning',
          title: 'Aucune sélection',
          message: 'Sélectionnez des clients pour optimiser leurs assignations'
        });
        return;
      }
      
      // Optimiser seulement les clients sélectionnés
      const selectedAssignments = context.assignments.map(assignment => ({
        ...assignment,
        logicalRooms: assignment.logicalRooms.map(room => ({
          ...room,
          assignedClients: room.assignedClients.filter(ac => 
            context.selectedClients.includes(ac.clientId._id)
          )
        }))
      }));
      
      await context.optimizeAssignments(selectedAssignments);
    },
    
    // Actions de regroupement
    reuniteSelectedGroups: async () => {
      const selectedClients = context.clients.filter(c => 
        context.selectedClients.includes(c._id)
      );
      
      const groupNames = [...new Set(
        selectedClients
          .filter(c => c.clientType === 'Groupe' && c.groupName)
          .map(c => c.groupName)
      )];
      
      if (groupNames.length === 0) {
        context.addNotification({
          type: 'info',
          title: 'Aucun groupe sélectionné',
          message: 'Sélectionnez des membres de groupes pour les regrouper'
        });
        return;
      }
      
      await context.reuniteGroups();
    },
    
    // Actions d'export
    exportSelection: async (format = 'csv') => {
      if (context.selectedClients.length === 0) {
        return context.exportAssignments(format, context.eventName);
      }
      
      // Exporter seulement les clients sélectionnés
      const filteredAssignments = context.assignments.map(assignment => ({
        ...assignment,
        logicalRooms: assignment.logicalRooms.map(room => ({
          ...room,
          assignedClients: room.assignedClients.filter(ac => 
            context.selectedClients.includes(ac.clientId._id)
          )
        })).filter(room => room.assignedClients.length > 0)
      })).filter(assignment => 
        assignment.logicalRooms.some(room => room.assignedClients.length > 0)
      );
      
      return context.exportAssignments(format, `${context.eventName}_selection`);
    }
  };
};

export default AssignmentContext;
