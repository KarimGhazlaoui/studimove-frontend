import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as assignmentUtils from '../utils/assignmentUtils';
import { getAssignmentConfig } from '../config/assignmentConfig';

export const useAssignments = (eventId, eventType = 'default') => {
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(() => getAssignmentConfig(eventType));

  // État pour les statistiques
  const [stats, setStats] = useState({
    totalClients: 0,
    assignedClients: 0,
    unassignedClients: 0,
    occupancyRate: 0,
    qualityScore: 0,
    conflicts: []
  });

  // Charger les données initiales
  const loadData = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Charger les clients
      const clientsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/clients?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!clientsResponse.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }
      
      const clientsData = await clientsResponse.json();
      setClients(clientsData.data || []);
      
      // Charger les hôtels
      const hotelsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/hotels?eventId=${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!hotelsResponse.ok) {
        throw new Error('Erreur lors du chargement des hôtels');
      }
      
      const hotelsData = await hotelsResponse.json();
      setHotels(hotelsData.data || []);
      
      // Charger les assignations existantes
      try {
        const assignmentsData = await assignmentUtils.assignmentAPI.load(eventId);
        if (assignmentsData.success && assignmentsData.data) {
          setAssignments(assignmentsData.data);
        } else {
          // Initialiser avec des assignations vides
          const emptyAssignments = initializeEmptyAssignments(hotelsData.data || []);
          setAssignments(emptyAssignments);
        }
      } catch (assignmentError) {
        console.warn('Aucune assignation existante, initialisation vide');
        const emptyAssignments = initializeEmptyAssignments(hotelsData.data || []);
        setAssignments(emptyAssignments);
      }
      
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError(err.message);
      toast.error(`Erreur lors du chargement: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  // Initialiser les assignations vides
  const initializeEmptyAssignments = (hotelsData) => {
    return hotelsData.map(hotel => ({
      hotelId: hotel,
      logicalRooms: assignmentUtils.generateLogicalRooms(hotel).map(room => ({
        ...room,
        assignedClients: []
      }))
    }));
  };

  // Calculer les statistiques
  const updateStats = useCallback(() => {
    if (!assignments.length || !clients.length) return;
    
    const report = assignmentUtils.generateAssignmentReport(assignments);
    const conflicts = assignmentUtils.findConflicts(assignments);
    const qualityScore = assignmentUtils.getAssignmentQualityScore(assignments);
    
    setStats({
      totalClients: clients.length,
      assignedClients: report.totalAssigned,
      unassignedClients: clients.length - report.totalAssigned,
      occupancyRate: report.overallOccupancyRate,
      qualityScore,
      conflicts
    });
  }, [assignments, clients]);

  // Assigner un client à une chambre
  const assignClient = useCallback(async (clientId, hotelId, roomId) => {
    try {
      const client = clients.find(c => c._id === clientId);
      if (!client) {
        throw new Error('Client non trouvé');
      }
      
      const newAssignments = [...assignments];
      const hotelAssignment = newAssignments.find(a => a.hotelId._id === hotelId);
      
      if (!hotelAssignment) {
        throw new Error('Hôtel non trouvé');
      }
      
      const room = hotelAssignment.logicalRooms.find(r => r.logicalRoomId === roomId);
      if (!room) {
        throw new Error('Chambre non trouvée');
      }
      
      // Vérifier la validation
      const validation = assignmentUtils.validateRoomAssignment(client, room, hotelId);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Retirer le client de son ancienne assignation s'il y en a une
      newAssignments.forEach(assignment => {
        assignment.logicalRooms.forEach(r => {
          r.assignedClients = r.assignedClients.filter(ac => ac.clientId._id !== clientId);
        });
      });
      
      // Ajouter le client à la nouvelle chambre
      room.assignedClients.push({
        clientId: client,
        assignedAt: new Date(),
        assignmentType: 'manual'
      });
      
      setAssignments(newAssignments);
      toast.success(`${client.firstName} ${client.lastName} assigné(e) avec succès`);
      
      return { success: true };
    } catch (err) {
      console.error('Erreur assignation client:', err);
      toast.error(`Erreur d'assignation: ${err.message}`);
      return { success: false, error: err.message };
    }
  }, [assignments, clients]);

  // Désassigner un client
  const unassignClient = useCallback((clientId) => {
    try {
      const newAssignments = [...assignments];
      let clientFound = false;
      
      newAssignments.forEach(assignment => {
        assignment.logicalRooms.forEach(room => {
          const clientIndex = room.assignedClients.findIndex(ac => ac.clientId._id === clientId);
          if (clientIndex !== -1) {
            const removedClient = room.assignedClients.splice(clientIndex, 1)[0];
            clientFound = true;
            toast.success(`${removedClient.clientId.firstName} ${removedClient.clientId.lastName} désassigné(e)`);
          }
        });
      });
      
      if (!clientFound) {
        toast.warning('Client non trouvé dans les assignations');
        return { success: false, error: 'Client non trouvé' };
      }
      
      setAssignments(newAssignments);
      return { success: true };
    } catch (err) {
      console.error('Erreur désassignation:', err);
      toast.error(`Erreur de désassignation: ${err.message}`);
      return { success: false, error: err.message };
    }
  }, [assignments]);

  // Assignation automatique
  const autoAssign = useCallback(async (options = {}) => {
    setLoading(true);
    
    try {
      // Récupérer les clients non assignés
      const assignedClientIds = new Set();
      assignments.forEach(assignment => {
        assignment.logicalRooms.forEach(room => {
          room.assignedClients.forEach(ac => {
            assignedClientIds.add(ac.clientId._id);
          });
        });
      });
      
      const unassignedClients = clients.filter(c => !assignedClientIds.has(c._id));
      
      if (unassignedClients.length === 0) {
        toast.info('Tous les clients sont déjà assignés');
        return { success: true, assigned: 0 };
      }
      
      // Effectuer l'assignation automatique
      const result = assignmentUtils.autoAssignUnassignedClients([...assignments], unassignedClients);
      
      if (result.assigned > 0) {
        setAssignments([...assignments]);
        toast.success(`${result.assigned} client(s) assigné(s) automatiquement`);
      }
      
      if (result.failed > 0) {
        toast.warning(`${result.failed} client(s) n'ont pas pu être assignés`);
      }
      
      return result;
    } catch (err) {
      console.error('Erreur assignation automatique:', err);
      toast.error(`Erreur d'assignation automatique: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [assignments, clients]);

  // Optimiser les assignations
  const optimizeAssignments = useCallback(async () => {
    setLoading(true);
    
    try {
      const optimized = assignmentUtils.optimizeAssignmentsByGenetic(assignments, clients);
      
      if (optimized.improvement > 0) {
        setAssignments(optimized.optimizedAssignment);
        toast.success(`Optimisation réussie! Score amélioré de ${optimized.improvement} points`);
      } else {
        toast.info('Les assignations sont déjà optimales');
      }
      
      return optimized;
    } catch (err) {
      console.error('Erreur optimisation:', err);
      toast.error(`Erreur d'optimisation: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [assignments, clients]);

  // Sauvegarder les assignations
  const saveAssignments = useCallback(async () => {
    if (!eventId) return;
    
    setSaving(true);
    
    try {
      const result = await assignmentUtils.assignmentAPI.save(eventId, assignments);
      
      if (result.success) {
        toast.success('Assignations sauvegardées avec succès');
        return { success: true };
      } else {
        throw new Error(result.message || 'Erreur de sauvegarde');
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      toast.error(`Erreur de sauvegarde: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [eventId, assignments]);

  // Exporter les assignations
  const exportAssignments = useCallback(async (format = 'csv', eventName = 'Événement') => {
    try {
      switch (format) {
        case 'csv':
          assignmentUtils.exportData.toCSV(assignments, eventName);
          break;
        case 'json':
          assignmentUtils.exportData.toJSON(assignments, clients, eventName);
          break;
        case 'pdf':
          await assignmentUtils.exportData.toPDF(assignments, clients, eventName);
          break;
        default:
          throw new Error('Format d\'export non supporté');
      }
      
      toast.success(`Export ${format.toUpperCase()} réussi`);
      return { success: true };
    } catch (err) {
      console.error('Erreur export:', err);
      toast.error(`Erreur d'export: ${err.message}`);
      return { success: false, error: err.message };
    }
  }, [assignments, clients]);

  // Obtenir les suggestions pour un client
  const getSuggestionsForClient = useCallback((clientId) => {
    const client = clients.find(c => c._id === clientId);
    if (!client) return [];
    
    return assignmentUtils.generateRoomSuggestions(client, assignments);
  }, [clients, assignments]);

  // Obtenir les clients non assignés
  const getUnassignedClients = useCallback(() => {
    const assignedClientIds = new Set();
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach(ac => {
          assignedClientIds.add(ac.clientId._id);
        });
      });
    });
    
    return clients.filter(c => !assignedClientIds.has(c._id));
  }, [assignments, clients]);

  // Obtenir le rapport détaillé
  const getDetailedReport = useCallback((eventName = 'Événement') => {
    return assignmentUtils.generateDetailedReport(assignments, clients, eventName);
  }, [assignments, clients]);

  // Réinitialiser toutes les assignations
  const resetAllAssignments = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les assignations ?')) {
      const emptyAssignments = initializeEmptyAssignments(hotels);
      setAssignments(emptyAssignments);
      toast.success('Assignations réinitialisées');
    }
  }, [hotels]);

  // Regrouper automatiquement les groupes séparés
  const reuniteGroups = useCallback(() => {
    const result = assignmentUtils.autoReuniteGroups(assignments);
    
    if (result.clientsMoved > 0) {
      setAssignments([...assignments]);
      toast.success(`${result.clientsMoved} client(s) regroupé(s) dans ${result.groupsProcessed} groupe(s)`);
    } else {
      toast.info('Aucun groupe à regrouper');
    }
    
    return result;
  }, [assignments]);

  // Équilibrer les hôtels
  const balanceHotels = useCallback(() => {
    const result = assignmentUtils.autoBalanceHotels(assignments);
    
    if (result.changes.length > 0) {
      setAssignments([...assignments]);
      toast.success(`${result.changes.length} client(s) déplacé(s) pour équilibrer les hôtels`);
    } else {
      toast.info('Les hôtels sont déjà équilibrés');
    }
    
    return result;
  }, [assignments]);

  // Charger les données au montage et quand eventId change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Mettre à jour les statistiques quand les assignations changent
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Interface retournée par le hook
  return {
    // État
    assignments,
    clients,
    hotels,
    loading,
    saving,
    error,
    stats,
    config,
    
    // Actions principales
    assignClient,
    unassignClient,
    autoAssign,
    optimizeAssignments,
    saveAssignments,
    exportAssignments,
    
    // Utilitaires
    getSuggestionsForClient,
    getUnassignedClients,
    getDetailedReport,
    resetAllAssignments,
    reuniteGroups,
    balanceHotels,
    
    // Contrôle
    loadData,
    updateStats,
    
    // Configuration
    updateConfig: setConfig
  };
};

// Hook pour gérer les statistiques en temps réel
export const useAssignmentStats = (assignments, clients) => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (!assignments.length || !clients.length) return;

    const report = assignmentUtils.generateAssignmentReport(assignments);
    const conflicts = assignmentUtils.findConflicts(assignments);
    const qualityScore = assignmentUtils.getAssignmentQualityScore(assignments);
    const recommendations = assignmentUtils.generateRecommendations(assignments);

    setStats({
      ...report,
      conflicts,
      qualityScore,
      recommendations
    });

    // Préparer les données pour les graphiques
    const charts = assignmentUtils.formatDataForCharts(assignments, clients);
    setChartData(charts);

  }, [assignments, clients]);

  return { stats, chartData };
};

// Hook pour gérer la validation en temps réel
export const useAssignmentValidation = (assignments) => {
  const [validation, setValidation] = useState({
    isValid: true,
    errors: [],
    warnings: [],
    criticalIssues: 0
  });

  useEffect(() => {
    if (!assignments.length) {
      setValidation({
        isValid: true,
        errors: [],
        warnings: [],
        criticalIssues: 0
      });
      return;
    }

    const validationResult = assignmentUtils.validateFullAssignment(assignments);
    const conflicts = assignmentUtils.findConflicts(assignments);
    
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    const warnings = conflicts.filter(c => c.severity === 'warning');

    setValidation({
      isValid: validationResult.isValid && criticalConflicts.length === 0,
      errors: validationResult.errors || [],
      warnings: warnings.map(w => w.message),
      criticalIssues: criticalConflicts.length
    });

  }, [assignments]);

  return validation;
};

// Hook pour gérer les notifications d'assignation
export const useAssignmentNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-suppression après 5 secondes pour les notifications de succès
    if (notification.type === 'success') {
      setTimeout(() => {
        removeNotification(id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notifications prédéfinies
  const notifyAssignment = useCallback((clientName, hotelName, roomId) => {
    addNotification({
      type: 'success',
      title: 'Client assigné',
      message: `${clientName} assigné(e) à la chambre ${roomId} de ${hotelName}`,
      icon: 'fas fa-check-circle'
    });
  }, [addNotification]);

  const notifyConflict = useCallback((conflictMessage) => {
    addNotification({
      type: 'error',
      title: 'Conflit détecté',
      message: conflictMessage,
      icon: 'fas fa-exclamation-triangle',
      persistent: true
    });
  }, [addNotification]);

  const notifyOptimization = useCallback((improvement) => {
    addNotification({
      type: 'info',
      title: 'Optimisation terminée',
      message: `Score amélioré de ${improvement} points`,
      icon: 'fas fa-magic'
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifyAssignment,
    notifyConflict,
    notifyOptimization
  };
};

// Hook pour gérer l'historique des assignations
export const useAssignmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const saveState = useCallback((assignments, action = 'manual') => {
    const snapshot = {
      id: Date.now(),
      timestamp: new Date(),
      assignments: JSON.parse(JSON.stringify(assignments)), // Deep copy
      action,
      description: getActionDescription(action)
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(snapshot);
      
      // Limiter l'historique à 50 entrées
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getActionDescription = (action) => {
    const descriptions = {
      manual: 'Assignation manuelle',
      auto: 'Assignation automatique',
      optimize: 'Optimisation',
      reunite: 'Regroupement',
      balance: 'Équilibrage',
      reset: 'Réinitialisation'
    };
    return descriptions[action] || 'Action inconnue';
  };

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  return {
    history,
    currentIndex,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory
  };
};

// Hook pour gérer les performances et le cache
export const useAssignmentCache = (eventId) => {
  const [cache, setCache] = useState(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  const getCacheKey = useCallback((operation, params) => {
    return `${eventId}_${operation}_${JSON.stringify(params)}`;
  }, [eventId]);

  const getFromCache = useCallback((operation, params) => {
    const key = getCacheKey(operation, params);
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
      setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
      return cached.data;
    }
    
    setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
    return null;
  }, [cache, getCacheKey]);

  const setInCache = useCallback((operation, params, data) => {
    const key = getCacheKey(operation, params);
    const newCache = new Map(cache);
    
    newCache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Limiter la taille du cache
    if (newCache.size > 100) {
      const firstKey = newCache.keys().next().value;
      newCache.delete(firstKey);
    }
    
    setCache(newCache);
    setCacheStats(prev => ({ ...prev, size: newCache.size }));
  }, [cache, getCacheKey]);

  const clearCache = useCallback(() => {
    setCache(new Map());
    setCacheStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  return {
    getFromCache,
    setInCache,
    clearCache,
    cacheStats
  };
};

// Hook principal qui combine tous les hooks
export const useAdvancedAssignments = (eventId, eventType = 'default', options = {}) => {
  const assignments = useAssignments(eventId, eventType);
  const stats = useAssignmentStats(assignments.assignments, assignments.clients);
  const validation = useAssignmentValidation(assignments.assignments);
  const notifications = useAssignmentNotifications();
  const history = useAssignmentHistory();
  const cache = useAssignmentCache(eventId);

  // Configuration des options
  const {
    enableHistory = true,
    enableCache = true,
    enableNotifications = true,
    autoSave = false,
    autoSaveInterval = 30000 // 30 secondes
  } = options;

  // Auto-sauvegarde
  useEffect(() => {
    if (!autoSave || !assignments.assignments.length) return;

    const interval = setInterval(() => {
      assignments.saveAssignments();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, assignments]);

  // Wrapper des fonctions avec historique et notifications
  const wrappedAssignClient = useCallback(async (clientId, hotelId, roomId) => {
    if (enableHistory) {
      history.saveState(assignments.assignments, 'manual');
    }

    const result = await assignments.assignClient(clientId, hotelId, roomId);

    if (result.success && enableNotifications) {
      const client = assignments.clients.find(c => c._id === clientId);
      const hotel = assignments.hotels.find(h => h._id === hotelId);
      notifications.notifyAssignment(
        `${client?.firstName} ${client?.lastName}`,
        hotel?.name,
        roomId
      );
    }

    return result;
  }, [assignments, history, notifications, enableHistory, enableNotifications]);

  const wrappedAutoAssign = useCallback(async (options) => {
    if (enableHistory) {
      history.saveState(assignments.assignments, 'auto');
    }

    return await assignments.autoAssign(options);
  }, [assignments, history, enableHistory]);

  const wrappedOptimize = useCallback(async () => {
    if (enableHistory) {
      history.saveState(assignments.assignments, 'optimize');
    }

    const result = await assignments.optimizeAssignments();

    if (result.improvement > 0 && enableNotifications) {
      notifications.notifyOptimization(result.improvement);
    }

    return result;
  }, [assignments, history, notifications, enableHistory, enableNotifications]);

  return {
    // État et données
    ...assignments,
    stats: stats.stats,
    chartData: stats.chartData,
    validation,
    notifications: notifications.notifications,
    history: history.history,
    cacheStats: cache.cacheStats,

    // Actions wrappées
    assignClient: wrappedAssignClient,
    autoAssign: wrappedAutoAssign,
    optimizeAssignments: wrappedOptimize,

    // Contrôles avancés
    undo: history.undo,
    redo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    clearHistory: history.clearHistory,
    
    // Notifications
    addNotification: notifications.addNotification,
    removeNotification: notifications.removeNotification,
    clearNotifications: notifications.clearAllNotifications,
    
    // Cache
    clearCache: cache.clearCache,
    
    // Utilitaires
    saveStateToHistory: history.saveState,
    getFromCache: cache.getFromCache,
    setInCache: cache.setInCache
  };
};

export default {
  useAssignments,
  useAssignmentStats,
  useAssignmentValidation,
  useAssignmentNotifications,
  useAssignmentHistory,
  useAssignmentCache,
  useAdvancedAssignments
};
