// Configuration par défaut pour les assignations

export const ASSIGNMENT_CONFIG = {
  // Règles générales
  rules: {
    // Mixité de genre
    allowMixedGender: false, // Par défaut, pas de mixité
    requireVIPForMixed: true, // Les chambres mixtes doivent être VIP
    
    // Capacité des chambres
    maxOccupancyRate: 100, // Taux d'occupation maximum
    preferredOccupancyRate: 80, // Taux d'occupation préféré
    allowOvercapacity: false, // Autoriser le dépassement de capacité
    
    // Groupes
    keepGroupsTogether: true, // Garder les membres du groupe ensemble
    separateGroupsIfNecessary: false, // Séparer si pas le choix
    maxGroupSeparation: 2, // Nombre maximum de chambres pour un groupe
    
    // Types de clients
    prioritizeVIP: true, // Donner la priorité aux VIP
    isolateInfluencers: false, // Isoler les influenceurs
    groupStaffTogether: true, // Regrouper le staff
    
    // Distance et proximité
    preferSameHotel: true, // Préférer le même hôtel pour les groupes
    maxDistanceBetweenRooms: 50, // Distance max entre chambres d'un groupe (mètres)
    
    // Âge et compatibilité
    considerAge: true, // Tenir compte de l'âge
    maxAgeDifference: 10, // Différence d'âge maximum acceptable
    
    // Préférences
    respectClientPreferences: true, // Respecter les préférences client
    allowPreferenceOverride: false // Permettre l'override des préférences
  },
  
  // Scores et pondérations
  scoring: {
    // Scores positifs (bonus)
    sameGroup: 100, // Même groupe
    sameGender: 20, // Même genre
    sameClientType: 30, // Même type de client
    vipInVipRoom: 50, // VIP en chambre VIP
    goodOccupancy: 30, // Bonne occupation (70-90%)
    ageCompatibility: 15, // Compatibilité d'âge
    preferenceMatch: 25, // Match des préférences
    sameHotel: 10, // Même hôtel pour le groupe
    
    // Scores négatifs (pénalités)
    mixedGenderPenalty: -50, // Mixité non autorisée
    vipInRegularRoom: -40, // VIP en chambre standard
    overcapacity: -100, // Surréservation
    groupSeparation: -60, // Séparation de groupe
    ageMismatch: -20, // Incompatibilité d'âge
    wrongClientType: -30, // Mauvais type de client
    lowOccupancy: -10, // Sous-occupation
    highOccupancy: -20 // Sur-occupation
  },
  
  // Contraintes par type de client
  clientTypeConstraints: {
    VIP: {
      requireVIPRoom: true,
      allowMixedRoom: true,
      preferSingleOccupancy: false,
      allowWithOtherTypes: ['VIP'],
      priorityLevel: 1
    },
    Influenceur: {
      requireVIPRoom: false,
      allowMixedRoom: true,
      preferSingleOccupancy: true,
      allowWithOtherTypes: ['Influenceur', 'VIP'],
      priorityLevel: 2
    },
    Staff: {
      requireVIPRoom: false,
      allowMixedRoom: false,
      preferSingleOccupancy: false,
      allowWithOtherTypes: ['Staff'],
      priorityLevel: 3
    },
    Groupe: {
      requireVIPRoom: false,
      allowMixedRoom: false,
      preferSingleOccupancy: false,
      allowWithOtherTypes: ['Groupe', 'Solo'],
      priorityLevel: 4,
      keepTogether: true
    },
    Solo: {
      requireVIPRoom: false,
      allowMixedRoom: false,
      preferSingleOccupancy: false,
      allowWithOtherTypes: ['Solo', 'Groupe'],
      priorityLevel: 5
    }
  },
  
  // Configuration des algorithmes
  algorithms: {
    // Algorithme génétique
    genetic: {
      populationSize: 20,
      generations: 100,
      mutationRate: 0.3,
      crossoverRate: 0.7,
      elitismRate: 0.1
    },
    
    // Algorithme glouton
    greedy: {
      sortByPriority: true,
      considerAllOptions: false,
      maxIterations: 1000
    },
    
    // Optimisation locale
    localSearch: {
      maxSwaps: 50,
      improvementThreshold: 5,
      maxNoImprovement: 10
    }
  },
  
  // Préférences d'export
  export: {
    formats: ['csv', 'json', 'pdf'],
    includeEmptyRooms: true,
    includeClientDetails: true,
    includeHotelInfo: true,
    includeStats: true
  },
  
  // Validation et contrôles
  validation: {
    // Contrôles obligatoires
    mandatory: [
      'capacity_check',
      'gender_compatibility',
      'client_type_compatibility'
    ],
    
    // Contrôles optionnels
    optional: [
      'age_compatibility',
      'preference_match',
      'group_integrity'
    ],
    
    // Seuils d'alerte
    thresholds: {
      criticalOccupancy: 95, // Occupation critique
      lowOccupancy: 30, // Occupation trop faible
      maxConflicts: 5, // Nombre maximum de conflits acceptables
      minQualityScore: 60 // Score de qualité minimum
    }
  },
  
  // Messages et notifications
  messages: {
    success: {
      autoAssign: 'Assignation automatique réussie',
      optimize: 'Optimisation terminée avec succès',
      save: 'Assignations sauvegardées',
      export: 'Export réalisé avec succès'
    },
    
    warnings: {
      lowOccupancy: 'Taux d\'occupation faible détecté',
      groupSeparated: 'Certains groupes ont été séparés',
      vipMisplaced: 'Clients VIP en chambres standards',
      mixedGender: 'Chambres mixtes détectées'
    },
    
    errors: {
      overcapacity: 'Dépassement de capacité détecté',
      incompatibleClients: 'Clients incompatibles dans la même chambre',
      noRoomAvailable: 'Aucune chambre disponible',
      validationFailed: 'Échec de la validation'
    }
  },
  
  // Interface utilisateur
  ui: {
    // Couleurs pour les différents statuts
    colors: {
      available: '#28a745',
      occupied: '#dc3545',
      partiallyOccupied: '#ffc107',
      vip: '#6f42c1',
      conflict: '#e83e8c',
      optimal: '#20c997'
    },
    
    // Icônes
    icons: {
      male: 'fas fa-mars',
      female: 'fas fa-venus',
      other: 'fas fa-genderless',
      vip: 'fas fa-crown',
      group: 'fas fa-users',
      solo: 'fas fa-user',
      staff: 'fas fa-user-tie',
      influencer: 'fas fa-star'
    },
    
    // Animations
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-out'
    }
  },
  
  // Performance
  performance: {
    // Pagination
    itemsPerPage: 50,
    virtualScrolling: true,
    
    // Cache
    cacheResults: true,
    cacheTimeout: 300000, // 5 minutes
    
    // Lazy loading
    lazyLoad: true,
    preloadNext: true
  },
  
  // Intégrations
  integrations: {
    // Export vers systèmes tiers
    pms: {
      enabled: false,
      endpoint: '',
      format: 'json'
    },
    
    // Notifications
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    
    // Analytics
    analytics: {
      trackAssignments: true,
      trackOptimizations: true,
      trackExports: true
    }
  }
};

// Configuration spécifique par événement (peut surcharger la config par défaut)
export const EVENT_SPECIFIC_CONFIG = {
  // Exemple pour événements d'entreprise
  corporate: {
    rules: {
      allowMixedGender: true,
      requireVIPForMixed: false,
      groupStaffTogether: true
    },
    clientTypeConstraints: {
      Staff: {
        allowMixedRoom: true,
        allowWithOtherTypes: ['Staff', 'VIP']
      }
    }
  },
  
  // Exemple pour événements étudiants
  student: {
    rules: {
      allowMixedGender: false,
      maxAgeDifference: 5,
      preferredOccupancyRate: 90
    },
    scoring: {
      ageCompatibility: 25,
      goodOccupancy: 40
    }
  },
  
  // Exemple pour événements VIP
  luxury: {
    rules: {
      allowMixedGender: true,
      requireVIPForMixed: true,
      prioritizeVIP: true
    },
    clientTypeConstraints: {
      VIP: {
        preferSingleOccupancy: true
      }
    }
  }
};

// Fonction pour obtenir la configuration fusionnée
export const getAssignmentConfig = (eventType = 'default') => {
  const baseConfig = { ...ASSIGNMENT_CONFIG };
  const specificConfig = EVENT_SPECIFIC_CONFIG[eventType];
  
  if (!specificConfig) {
    return baseConfig;
  }
  
  // Fusion profonde des configurations
  const mergeDeep = (target, source) => {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
    return target;
  };
  
  return mergeDeep(baseConfig, specificConfig);
};

// Validation de la configuration
export const validateConfig = (config) => {
  const errors = [];
  
  // Vérifier les valeurs obligatoires
  if (!config.rules) {
    errors.push('Section "rules" manquante');
  }
  
  if (!config.scoring) {
    errors.push('Section "scoring" manquante');
  }
  
  if (!config.clientTypeConstraints) {
    errors.push('Section "clientTypeConstraints" manquante');
  }
  
  // Vérifier les valeurs numériques
  if (config.rules?.maxOccupancyRate && config.rules.maxOccupancyRate <= 0) {
    errors.push('maxOccupancyRate doit être supérieur à 0');
  }
  
  if (config.rules?.preferredOccupancyRate && config.rules.preferredOccupancyRate <= 0) {
    errors.push('preferredOccupancyRate doit être supérieur à 0');
  }
  
  // Vérifier la cohérence
  if (config.rules?.preferredOccupancyRate > config.rules?.maxOccupancyRate) {
    errors.push('preferredOccupancyRate ne peut pas être supérieur à maxOccupancyRate');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fonction pour sauvegarder la configuration personnalisée
export const saveCustomConfig = (config, eventId) => {
  const validation = validateConfig(config);
  
  if (!validation.isValid) {
    throw new Error(`Configuration invalide: ${validation.errors.join(', ')}`);
  }
  
  const configKey = `assignment_config_${eventId}`;
  localStorage.setItem(configKey, JSON.stringify(config));
  
  return {
    success: true,
    message: 'Configuration sauvegardée avec succès'
  };
};

// Fonction pour charger la configuration personnalisée
export const loadCustomConfig = (eventId) => {
  try {
    const configKey = `assignment_config_${eventId}`;
    const savedConfig = localStorage.getItem(configKey);
    
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      const validation = validateConfig(config);
      
      if (validation.isValid) {
        return config;
      } else {
        console.warn('Configuration invalide détectée, utilisation de la configuration par défaut');
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
  }
  
  return ASSIGNMENT_CONFIG;
};

export default {
  ASSIGNMENT_CONFIG,
  EVENT_SPECIFIC_CONFIG,
  getAssignmentConfig,
  validateConfig,
  saveCustomConfig,
  loadCustomConfig
};