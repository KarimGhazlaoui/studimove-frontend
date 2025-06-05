// Utilitaires pour la logique d'assignation

export const calculateOccupancyRate = (assigned, capacity) => {
  if (capacity === 0) return 0;
  return Math.round((assigned / capacity) * 100);
};

export const getRoomStatusColor = (occupancyRate) => {
  if (occupancyRate === 0) return 'success';
  if (occupancyRate < 100) return 'warning';
  return 'danger';
};

export const getClientTypeColor = (type) => {
  const colors = {
    'Solo': 'primary',
    'Groupe': 'info',
    'VIP': 'warning',
    'Influenceur': 'danger',
    'Staff': 'dark'
  };
  return colors[type] || 'secondary';
};

export const getGenderColor = (gender) => {
  const colors = {
    'Homme': 'primary',
    'Femme': 'danger',
    'Autre': 'secondary'
  };
  return colors[gender] || 'secondary';
};

export const getGenderIcon = (gender) => {
  const icons = {
    'Homme': '👨',
    'Femme': '👩',
    'Autre': '👤'
  };
  return icons[gender] || '👤';
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Formater le numéro français
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  } else if (cleaned.length === 12 && cleaned.startsWith('33')) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
  }
  
  return phone;
};

export const validateRoomAssignment = (client, room, hotel) => {
  const errors = [];
  
  // Vérifier la capacité
  if (room.assignedClients.length >= room.maxCapacity) {
    errors.push('La chambre est déjà pleine');
  }
  
  // Vérifier la compatibilité des genres (si mixte non autorisé)
  if (!hotel.allowMixedGender && room.assignedClients.length > 0) {
    const existingGenders = room.assignedClients.map(c => c.clientId.gender);
    if (!existingGenders.includes(client.gender)) {
      errors.push('Cette chambre ne permet pas la mixité des genres');
    }
  }
  
  // Vérifier les préférences VIP
  if (client.clientType === 'VIP' && !room.isVIP) {
    errors.push('Les clients VIP doivent être assignés à des chambres VIP');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateRoomSuggestions = (client, assignments) => {
  const suggestions = [];
  
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      if (room.assignedClients.length < room.maxCapacity) {
        const validation = validateRoomAssignment(client, room, assignment.hotelId);
        
        let score = 0;
        let reasons = [];
        
        // Scoring basé sur différents critères
        if (validation.isValid) {
          score += 10;
          
          // Préférence pour les chambres avec des clients du même type
          const sameTypeClients = room.assignedClients.filter(
            ac => ac.clientId.clientType === client.clientType
          ).length;
          if (sameTypeClients > 0) {
            score += 5;
            reasons.push('Même type de client');
          }
          
          // Préférence pour les chambres du même groupe
          if (client.groupName) {
            const sameGroupClients = room.assignedClients.filter(
              ac => ac.clientId.groupName === client.groupName
            ).length;
            if (sameGroupClients > 0) {
              score += 15;
              reasons.push('Même groupe');
            }
          }
          
          // Pénalité pour les chambres VIP si pas VIP
          if (room.isVIP && client.clientType !== 'VIP') {
            score -= 5;
            reasons.push('Chambre VIP non nécessaire');
          }
          
          // Bonus pour les chambres VIP si VIP
          if (room.isVIP && client.clientType === 'VIP') {
            score += 10;
            reasons.push('Chambre VIP appropriée');
          }
          
          // Préférence pour les chambres moins remplies
          const occupancyRate = (room.assignedClients.length / room.maxCapacity) * 100;
          if (occupancyRate < 50) {
            score += 3;
            reasons.push('Chambre peu occupée');
          }
          
          // Bonus pour les hôtels de meilleure qualité
          if (assignment.hotelId.stars >= 4) {
            score += 2;
            reasons.push(`Hôtel ${assignment.hotelId.stars} étoiles`);
          }
          
          suggestions.push({
            hotelId: assignment.hotelId._id,
            hotelName: assignment.hotelId.name,
            roomId: room.logicalRoomId,
            roomType: room.roomType,
            score,
            reasons,
            validation,
            occupancyRate,
            availableSpots: room.maxCapacity - room.assignedClients.length
          });
        }
      }
    });
  });
  
  // Trier par score décroissant
  return suggestions.sort((a, b) => b.score - a.score);
};

export const generateAssignmentReport = (assignments) => {
  const report = {
    totalHotels: assignments.length,
    totalRooms: 0,
    totalCapacity: 0,
    totalAssigned: 0,
    totalVIPRooms: 0,
    totalMixedRooms: 0,
    occupancyByHotel: [],
    roomTypeDistribution: {},
    clientTypeDistribution: {},
    genderDistribution: { Homme: 0, Femme: 0, Autre: 0 },
    issuesFound: []
  };
  
  assignments.forEach(assignment => {
    const hotelStats = {
      hotelId: assignment.hotelId._id,
      hotelName: assignment.hotelId.name,
      totalRooms: assignment.logicalRooms.length,
      totalCapacity: 0,
      totalAssigned: 0,
      occupancyRate: 0,
      roomTypes: {}
    };
    
    assignment.logicalRooms.forEach(room => {
      report.totalRooms++;
      report.totalCapacity += room.maxCapacity;
      report.totalAssigned += room.assignedClients.length;
      
      hotelStats.totalCapacity += room.maxCapacity;
      hotelStats.totalAssigned += room.assignedClients.length;
      
      // Statistiques par type de chambre
      if (!report.roomTypeDistribution[room.roomType]) {
        report.roomTypeDistribution[room.roomType] = { count: 0, capacity: 0, assigned: 0 };
      }
      report.roomTypeDistribution[room.roomType].count++;
      report.roomTypeDistribution[room.roomType].capacity += room.maxCapacity;
      report.roomTypeDistribution[room.roomType].assigned += room.assignedClients.length;
      
      if (!hotelStats.roomTypes[room.roomType]) {
        hotelStats.roomTypes[room.roomType] = { count: 0, assigned: 0 };
      }
      hotelStats.roomTypes[room.roomType].count++;
      hotelStats.roomTypes[room.roomType].assigned += room.assignedClients.length;
      
      // Vérifier si c'est une chambre VIP
      if (room.isVIP) {
        report.totalVIPRooms++;
      }
      
      // Vérifier si c'est une chambre mixte
      if (room.assignedClients.length > 1) {
        const genders = [...new Set(room.assignedClients.map(c => c.clientId.gender))];
        if (genders.length > 1) {
          report.totalMixedRooms++;
        }
      }
      
      // Statistiques par type de client
      room.assignedClients.forEach(assignedClient => {
        const clientType = assignedClient.clientId.clientType;
        const gender = assignedClient.clientId.gender;
        
        if (!report.clientTypeDistribution[clientType]) {
          report.clientTypeDistribution[clientType] = 0;
        }
        report.clientTypeDistribution[clientType]++;
        
        if (report.genderDistribution[gender] !== undefined) {
          report.genderDistribution[gender]++;
        }
        
        // Vérifier les problèmes potentiels
        if (clientType === 'VIP' && !room.isVIP) {
          report.issuesFound.push({
            type: 'VIP_IN_REGULAR_ROOM',
            message: `Client VIP ${assignedClient.clientId.firstName} ${assignedClient.clientId.lastName} dans une chambre non-VIP`,
            hotelName: assignment.hotelId.name,
            roomId: room.logicalRoomId
          });
        }
      });
    });
    
    hotelStats.occupancyRate = hotelStats.totalCapacity > 0 
      ? Math.round((hotelStats.totalAssigned / hotelStats.totalCapacity) * 100) 
      : 0;
    
    report.occupancyByHotel.push(hotelStats);
  });
  
  report.overallOccupancyRate = report.totalCapacity > 0 
    ? Math.round((report.totalAssigned / report.totalCapacity) * 100) 
    : 0;
  
  return report;
};

export const exportAssignmentToCSV = (assignments, eventName) => {
  const csvData = [];
  
  // En-têtes
  csvData.push([
    'Hôtel',
    'Chambre',
    'Type de chambre',
    'Capacité',
    'Occupé',
    'Client',
    'Téléphone',
    'Type client',
    'Sexe',
    'Groupe',
    'Mode assignation',
    'Date assignation'
  ]);
  
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      if (room.assignedClients.length === 0) {
        // Chambre vide
        csvData.push([
          assignment.hotelId.name,
          room.logicalRoomId,
          room.roomType,
          room.maxCapacity,
          0,
          'VIDE',
          '',
          '',
          '',
          '',
          '',
          ''
        ]);
      } else {
        // Chambre avec clients
        room.assignedClients.forEach(assignedClient => {
          csvData.push([
            assignment.hotelId.name,
            room.logicalRoomId,
            room.roomType,
            room.maxCapacity,
            room.assignedClients.length,
            `${assignedClient.clientId.firstName} ${assignedClient.clientId.lastName}`,
            assignedClient.clientId.phone,
            assignedClient.clientId.clientType,
            assignedClient.clientId.gender,
            assignedClient.clientId.groupName || '',
            assignedClient.assignmentType,
            new Date(assignedClient.assignedAt).toLocaleDateString('fr-FR')
          ]);
        });
      }
    });
  });
  
  // Convertir en CSV
  const csvContent = csvData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  // Télécharger le fichier
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `assignations_${eventName}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getAssignmentQualityScore = (assignments) => {
  let totalScore = 0;
  let maxScore = 0;
  
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      room.assignedClients.forEach(assignedClient => {
        maxScore += 10; // Score maximum par client
        
        // Points pour l'assignation correcte
        totalScore += 3; // Base pour être assigné
        
        // Bonus pour les clients VIP en chambre VIP
        if (assignedClient.clientId.clientType === 'VIP' && room.isVIP) {
          totalScore += 3;
        }
        
        // Bonus pour les groupes ensemble
        if (assignedClient.clientId.groupName) {
          const sameGroupInRoom = room.assignedClients.filter(
            ac => ac.clientId.groupName === assignedClient.clientId.groupName
          ).length;
          if (sameGroupInRoom > 1) {
            totalScore += 2;
          }
        }
        
        // Bonus pour l'optimisation de l'espace
        const occupancyRate = (room.assignedClients.length / room.maxCapacity) * 100;
        if (occupancyRate >= 80) {
          totalScore += 2;
        }
      });
    });
  });
  
  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

export const findConflicts = (assignments) => {
  const conflicts = [];
  
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      // Vérifier les conflits de genre
      if (room.assignedClients.length > 1) {
        const genders = room.assignedClients.map(c => c.clientId.gender);
        const uniqueGenders = [...new Set(genders)];
        
        if (uniqueGenders.length > 1 && !assignment.hotelId.allowMixedGender) {
          conflicts.push({
            type: 'MIXED_GENDER_NOT_ALLOWED',
            severity: 'high',
            message: `Chambre mixte non autorisée: ${room.logicalRoomId} à ${assignment.hotelId.name}`,
            hotelId: assignment.hotelId._id,
            roomId: room.logicalRoomId,
            clients: room.assignedClients.map(c => ({
              name: `${c.clientId.firstName} ${c.clientId.lastName}`,
              gender: c.clientId.gender
            }))
          });
        }
      }
      
      // Vérifier les surréservations
      if (room.assignedClients.length > room.maxCapacity) {
        conflicts.push({
          type: 'OVER_CAPACITY',
          severity: 'critical',
          message: `Chambre surréservée: ${room.logicalRoomId} (${room.assignedClients.length}/${room.maxCapacity})`,
          hotelId: assignment.hotelId._id,
          roomId: room.logicalRoomId,
          excess: room.assignedClients.length - room.maxCapacity
        });
      }
      
      // Vérifier les clients VIP mal placés
      room.assignedClients.forEach(assignedClient => {
        if (assignedClient.clientId.clientType === 'VIP' && !room.isVIP) {
          conflicts.push({
            type: 'VIP_IN_REGULAR_ROOM',
            severity: 'medium',
            message: `Client VIP en chambre standard: ${assignedClient.clientId.firstName} ${assignedClient.clientId.lastName}`,
            hotelId: assignment.hotelId._id,
            roomId: room.logicalRoomId,
            clientId: assignedClient.clientId._id
          });
        }
      });
    });
  });
  
  return conflicts;
};

export const optimizeAssignments = (assignments, clients) => {
  const optimized = JSON.parse(JSON.stringify(assignments)); // Deep copy
  const suggestions = [];
  
  // Identifier les améliorations possibles
  optimized.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      // Optimiser les groupes séparés
      if (room.assignedClients.length < room.maxCapacity) {
        room.assignedClients.forEach(assignedClient => {
          if (assignedClient.clientId.groupName) {
            // Chercher d'autres membres du groupe dans d'autres chambres
            const groupMembers = [];
            optimized.forEach(otherAssignment => {
              otherAssignment.logicalRooms.forEach(otherRoom => {
                if (otherRoom.logicalRoomId !== room.logicalRoomId) {
                  otherRoom.assignedClients.forEach(otherClient => {
                    if (otherClient.clientId.groupName === assignedClient.clientId.groupName) {
                      groupMembers.push({
                        client: otherClient,
                        hotelId: otherAssignment.hotelId._id,
                        roomId: otherRoom.logicalRoomId
                      });
                    }
                  });
                }
              });
            });
            
            if (groupMembers.length > 0) {
              const availableSpots = room.maxCapacity - room.assignedClients.length;
              if (availableSpots >= groupMembers.length) {
                suggestions.push({
                  type: 'GROUP_REUNIFICATION',
                  priority: 'high',
                  message: `Regrouper les membres du groupe "${assignedClient.clientId.groupName}" dans la chambre ${room.logicalRoomId}`,
                  targetRoom: {
                    hotelId: assignment.hotelId._id,
                    roomId: room.logicalRoomId
                  },
                  clientsToMove: groupMembers
                });
              }
            }
          }
        });
      }
    });
  });
  
  return {
    optimizedAssignments: optimized,
    suggestions
  };
};

// Fonction pour calculer la compatibilité entre deux clients
export const calculateClientCompatibility = (client1, client2) => {
  let score = 0;
  
  // Même groupe = compatibilité maximale
  if (client1.groupName && client1.groupName === client2.groupName) {
    return 100;
  }
  
  // Même type de client
  if (client1.clientType === client2.clientType) {
    score += 30;
  }
  
  // Même genre (si pas de mixité)
  if (client1.gender === client2.gender) {
    score += 20;
  }
  
  // Pénalité pour types incompatibles
  if (client1.clientType === 'VIP' && client2.clientType !== 'VIP') {
    score -= 20;
  }
  
  if (client1.clientType === 'Staff' && client2.clientType !== 'Staff') {
    score -= 10;
  }
  
  // Bonus pour âges similaires (si disponible)
  if (client1.age && client2.age) {
    const ageDiff = Math.abs(client1.age - client2.age);
    if (ageDiff <= 5) score += 15;
    else if (ageDiff <= 10) score += 10;
    else if (ageDiff <= 15) score += 5;
  }
  
  // Bonus pour mêmes préférences
  if (client1.preferences && client2.preferences) {
    const commonPreferences = Object.keys(client1.preferences).filter(
      key => client1.preferences[key] === client2.preferences[key]
    );
    score += commonPreferences.length * 5;
  }
  
  return Math.max(0, Math.min(100, score));
};

// Fonction pour trouver la meilleure chambre pour un client
export const findBestRoomForClient = (client, assignments) => {
  const suggestions = generateRoomSuggestions(client, assignments);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  // Retourner la meilleure suggestion
  return {
    hotelId: suggestions[0].hotelId,
    roomId: suggestions[0].roomId,
    score: suggestions[0].score,
    reasons: suggestions[0].reasons
  };
};

// Fonction pour valider une assignation complète
export const validateFullAssignment = (assignments, clients) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalClients: clients.length,
      assignedClients: 0,
      unassignedClients: 0,
      totalCapacity: 0,
      occupancyRate: 0
    }
  };
  
  // Compter les clients assignés
  let assignedClientIds = new Set();
  let totalCapacity = 0;
  
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      totalCapacity += room.maxCapacity;
      
      room.assignedClients.forEach(assignedClient => {
        assignedClientIds.add(assignedClient.clientId._id);
        
        // Vérifier les validations de base
        const roomValidation = validateRoomAssignment(
          assignedClient.clientId, 
          room, 
          assignment.hotelId
        );
        
        if (!roomValidation.isValid) {
          validation.errors.push({
            type: 'ROOM_ASSIGNMENT_INVALID',
            message: `Client ${assignedClient.clientId.firstName} ${assignedClient.clientId.lastName}: ${roomValidation.errors.join(', ')}`,
            clientId: assignedClient.clientId._id,
            hotelId: assignment.hotelId._id,
            roomId: room.logicalRoomId
          });
          validation.isValid = false;
        }
      });
    });
  });
  
  validation.stats.assignedClients = assignedClientIds.size;
  validation.stats.unassignedClients = clients.length - assignedClientIds.size;
  validation.stats.totalCapacity = totalCapacity;
  validation.stats.occupancyRate = totalCapacity > 0 
    ? Math.round((assignedClientIds.size / totalCapacity) * 100) 
    : 0;
  
  // Vérifier les clients non assignés
  if (validation.stats.unassignedClients > 0) {
    validation.warnings.push({
      type: 'UNASSIGNED_CLIENTS',
      message: `${validation.stats.unassignedClients} client(s) non assigné(s)`,
      count: validation.stats.unassignedClients
    });
  }
  
  // Vérifier la sous-utilisation
  if (validation.stats.occupancyRate < 70) {
    validation.warnings.push({
      type: 'LOW_OCCUPANCY',
      message: `Taux d'occupation faible: ${validation.stats.occupancyRate}%`,
      occupancyRate: validation.stats.occupancyRate
    });
  }
  
  return validation;
};

// Fonction pour auto-assigner les clients non assignés
export const autoAssignUnassignedClients = (assignments, unassignedClients) => {
  const results = {
    assigned: 0,
    failed: 0,
    errors: []
  };
  
  // Trier les clients par priorité (VIP, Staff, Groupes, puis Solo)
  const sortedClients = [...unassignedClients].sort((a, b) => {
    const priorityOrder = { 'VIP': 4, 'Staff': 3, 'Groupe': 2, 'Solo': 1, 'Influenceur': 1 };
    return (priorityOrder[b.clientType] || 0) - (priorityOrder[a.clientType] || 0);
  });
  
  sortedClients.forEach(client => {
    const bestRoom = findBestRoomForClient(client, assignments);
    
    if (bestRoom) {
      // Trouver l'assignation et la chambre
      const assignment = assignments.find(a => a.hotelId._id === bestRoom.hotelId);
      const room = assignment.logicalRooms.find(r => r.logicalRoomId === bestRoom.roomId);
      
      if (room && room.assignedClients.length < room.maxCapacity) {
        // Ajouter le client à la chambre
        room.assignedClients.push({
          clientId: client,
          assignedAt: new Date(),
          assignmentType: 'auto'
        });
        
        results.assigned++;
      } else {
        results.failed++;
        results.errors.push({
          clientId: client._id,
          message: `Impossible d'assigner ${client.firstName} ${client.lastName}: chambre indisponible`
        });
      }
    } else {
      results.failed++;
      results.errors.push({
        clientId: client._id,
        message: `Aucune chambre disponible pour ${client.firstName} ${client.lastName}`
      });
    }
  });
  
  return results;
};

// Fonction pour optimiser les assignations par algorithme génétique simplifié
export const optimizeAssignmentsByGenetic = (assignments, clients, iterations = 100) => {
  // Créer une population initiale
  let population = Array.from({ length: 20 }, () => 
    JSON.parse(JSON.stringify(assignments))
  );
  
  // Fonction de fitness
  const calculateFitness = (assignment) => {
    let score = 0;
    let penalties = 0;
    
    assignment.forEach(hotelAssignment => {
      hotelAssignment.logicalRooms.forEach(room => {
        // Bonus pour l'occupation optimale
        const occupancyRate = (room.assignedClients.length / room.maxCapacity) * 100;
        if (occupancyRate >= 80 && occupancyRate <= 100) {
          score += 10;
        } else if (occupancyRate > 100) {
          penalties += 50; // Pénalité forte pour surréservation
        }
        
        // Bonus pour les groupes ensemble
        const groups = {};
        room.assignedClients.forEach(ac => {
          if (ac.clientId.groupName) {
            groups[ac.clientId.groupName] = (groups[ac.clientId.groupName] || 0) + 1;
          }
        });
        
        Object.values(groups).forEach(count => {
          if (count > 1) score += count * 5;
        });
        
        // Bonus pour les clients VIP en chambres VIP
        room.assignedClients.forEach(ac => {
          if (ac.clientId.clientType === 'VIP' && room.isVIP) {
            score += 5;
          } else if (ac.clientId.clientType === 'VIP' && !room.isVIP) {
            penalties += 10;
          }
        });
        
        // Vérifier la compatibilité des genres
        if (room.assignedClients.length > 1) {
          const genders = [...new Set(room.assignedClients.map(ac => ac.clientId.gender))];
          if (genders.length > 1 && !hotelAssignment.hotelId.allowMixedGender) {
            penalties += 20;
          }
        }
      });
    });
    
    return Math.max(0, score - penalties);
  };
  
  // Évolution sur plusieurs générations
  for (let generation = 0; generation < iterations; generation++) {
    // Calculer la fitness de chaque individu
    const fitnessScores = population.map(individual => ({
      assignment: individual,
      fitness: calculateFitness(individual)
    }));
    
    // Trier par fitness
    fitnessScores.sort((a, b) => b.fitness - a.fitness);
    
    // Sélectionner les meilleurs (élitisme)
    const survivors = fitnessScores.slice(0, 10).map(item => item.assignment);
    
    // Créer une nouvelle génération
    const newPopulation = [...survivors];
    
    // Croisement et mutation
    while (newPopulation.length < 20) {
      const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
      const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
      
      // Croisement simple (copie du parent 1 avec quelques modifications du parent 2)
      const child = JSON.parse(JSON.stringify(parent1));
      
      // Mutation: échanger quelques clients entre chambres
      if (Math.random() < 0.3) { // 30% de chance de mutation
        // Logique de mutation simple
        const hotelIndex = Math.floor(Math.random() * child.length);
        const hotel = child[hotelIndex];
        
        if (hotel.logicalRooms.length > 1) {
          const room1Index = Math.floor(Math.random() * hotel.logicalRooms.length);
          const room2Index = Math.floor(Math.random() * hotel.logicalRooms.length);
          
          if (room1Index !== room2Index) {
            const room1 = hotel.logicalRooms[room1Index];
            const room2 = hotel.logicalRooms[room2Index];
            
            if (room1.assignedClients.length > 0 && room2.assignedClients.length < room2.maxCapacity) {
              const clientToMove = room1.assignedClients.pop();
              room2.assignedClients.push(clientToMove);
            }
          }
        }
      }
      
      newPopulation.push(child);
    }
    
    population = newPopulation;
  }
  
  // Retourner le meilleur individu
  const finalScores = population.map(individual => ({
    assignment: individual,
    fitness: calculateFitness(individual)
  }));
  
  finalScores.sort((a, b) => b.fitness - a.fitness);
  
  return {
    optimizedAssignment: finalScores[0].assignment,
    fitness: finalScores[0].fitness,
    improvement: finalScores[0].fitness - calculateFitness(assignments)
  };
};

// Fonction pour générer un rapport détaillé d'assignation
export const generateDetailedReport = (assignments, clients, eventName) => {
  const report = generateAssignmentReport(assignments);
  const conflicts = findConflicts(assignments);
  const validation = validateFullAssignment(assignments, clients);
  const qualityScore = getAssignmentQualityScore(assignments);
  
  return {
    event: eventName,
    generatedAt: new Date().toISOString(),
    summary: {
      totalClients: clients.length,
      assignedClients: validation.stats.assignedClients,
      unassignedClients: validation.stats.unassignedClients,
      totalHotels: report.totalHotels,
      totalRooms: report.totalRooms,
      totalCapacity: report.totalCapacity,
      occupancyRate: report.overallOccupancyRate,
      qualityScore: qualityScore
    },
    statistics: {
      byClientType: report.clientTypeDistribution,
      byGender: report.genderDistribution,
      byRoomType: report.roomTypeDistribution,
      byHotel: report.occupancyByHotel
    },
    qualityMetrics: {
      score: qualityScore,
      conflicts: conflicts.length,
      criticalIssues: conflicts.filter(c => c.severity === 'critical').length,
      warnings: validation.warnings.length
    },
    issues: {
      conflicts: conflicts,
      validation: validation,
      recommendations: generateRecommendations(assignments, conflicts, validation)
    }
  };
};

// Fonction pour générer des recommandations d'amélioration
export const generateRecommendations = (assignments, conflicts, validation) => {
  const recommendations = [];
  
  // Recommandations basées sur les conflits
  if (conflicts.length > 0) {
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    if (criticalConflicts.length > 0) {
      recommendations.push({
        priority: 'critical',
        type: 'RESOLVE_CONFLICTS',
        title: 'Résoudre les conflits critiques',
        description: `${criticalConflicts.length} conflit(s) critique(s) détecté(s) nécessitant une attention immédiate`,
        actions: criticalConflicts.map(c => c.message)
      });
    }
  }
  
  // Recommandations basées sur l'occupation
  if (validation.stats.occupancyRate < 70) {
    recommendations.push({
      priority: 'medium',
      type: 'IMPROVE_OCCUPANCY',
      title: 'Améliorer le taux d\'occupation',
      description: `Taux d'occupation actuel: ${validation.stats.occupancyRate}%. Considérez regrouper les clients ou réduire le nombre de chambres.`,
      actions: [
        'Regrouper les clients compatibles',
        'Fermer les chambres les moins occupées',
        'Réassigner les clients des chambres partiellement occupées'
      ]
    });
  }
  
  //
  // Recommandations basées sur les groupes séparés
  const separatedGroups = findSeparatedGroups(assignments);
  if (separatedGroups.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'REUNITE_GROUPS',
      title: 'Regrouper les membres des groupes',
      description: `${separatedGroups.length} groupe(s) sont séparés dans différentes chambres`,
      actions: separatedGroups.map(group => 
        `Regrouper les membres du groupe "${group.groupName}" actuellement répartis dans ${group.rooms.length} chambres`
      )
    });
  }
  
  // Recommandations basées sur les clients VIP
  const vipIssues = findVIPIssues(assignments);
  if (vipIssues.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'FIX_VIP_PLACEMENT',
      title: 'Corriger le placement des clients VIP',
      description: `${vipIssues.length} client(s) VIP mal placé(s)`,
      actions: vipIssues.map(issue => 
        `Déplacer ${issue.clientName} vers une chambre VIP`
      )
    });
  }
  
  // Recommandations d'optimisation générale
  if (validation.stats.occupancyRate > 90) {
    recommendations.push({
      priority: 'low',
      type: 'OPTIMIZE_SPACE',
      title: 'Optimiser l\'utilisation de l\'espace',
      description: 'Taux d\'occupation élevé - vérifier s\'il est possible d\'optimiser les assignations',
      actions: [
        'Vérifier les possibilités de regroupement',
        'Analyser les préférences des clients pour des optimisations',
        'Considérer l\'ajout de chambres supplémentaires si nécessaire'
      ]
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });
};

// Fonction pour trouver les groupes séparés
export const findSeparatedGroups = (assignments) => {
  const groupRooms = {};
  
  // Analyser où sont placés les membres de chaque groupe
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      room.assignedClients.forEach(assignedClient => {
        if (assignedClient.clientId.groupName) {
          const groupName = assignedClient.clientId.groupName;
          if (!groupRooms[groupName]) {
            groupRooms[groupName] = new Set();
          }
          groupRooms[groupName].add(`${assignment.hotelId._id}-${room.logicalRoomId}`);
        }
      });
    });
  });
  
  // Retourner les groupes séparés
  return Object.entries(groupRooms)
    .filter(([groupName, rooms]) => rooms.size > 1)
    .map(([groupName, rooms]) => ({
      groupName,
      rooms: Array.from(rooms),
      roomCount: rooms.size
    }));
};

// Fonction pour trouver les problèmes VIP
export const findVIPIssues = (assignments) => {
  const issues = [];
  
  assignments.forEach(assignment => {
    assignment.logicalRooms.forEach(room => {
      room.assignedClients.forEach(assignedClient => {
        if (assignedClient.clientId.clientType === 'VIP' && !room.isVIP) {
          issues.push({
            clientId: assignedClient.clientId._id,
            clientName: `${assignedClient.clientId.firstName} ${assignedClient.clientId.lastName}`,
            hotelId: assignment.hotelId._id,
            hotelName: assignment.hotelId.name,
            roomId: room.logicalRoomId,
            issue: 'VIP client in non-VIP room'
          });
        }
      });
    });
  });
  
  return issues;
};

// Fonction pour calculer la distance entre deux hôtels (si coordonnées disponibles)
export const calculateHotelDistance = (hotel1, hotel2) => {
  if (!hotel1.coordinates || !hotel2.coordinates) {
    return null;
  }
  
  const R = 6371; // Rayon de la Terre en km
  const dLat = (hotel2.coordinates.lat - hotel1.coordinates.lat) * Math.PI / 180;
  const dLon = (hotel2.coordinates.lng - hotel1.coordinates.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(hotel1.coordinates.lat * Math.PI / 180) * Math.cos(hotel2.coordinates.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
};

// Fonction pour regrouper automatiquement les groupes séparés
export const autoReuniteGroups = (assignments) => {
  const changes = [];
  const separatedGroups = findSeparatedGroups(assignments);
  
  separatedGroups.forEach(separatedGroup => {
    const groupMembers = [];
    
    // Collecter tous les membres du groupe avec leurs informations de chambre
    assignments.forEach(assignment => {
      assignment.logicalRooms.forEach(room => {
        room.assignedClients.forEach((assignedClient, index) => {
          if (assignedClient.clientId.groupName === separatedGroup.groupName) {
            groupMembers.push({
              client: assignedClient,
              hotelId: assignment.hotelId._id,
              hotelName: assignment.hotelId.name,
              roomId: room.logicalRoomId,
              roomIndex: assignment.logicalRooms.findIndex(r => r.logicalRoomId === room.logicalRoomId),
              clientIndex: index
            });
          }
        });
      });
    });
    
    if (groupMembers.length > 1) {
      // Trouver la meilleure chambre pour regrouper
      let bestRoom = null;
      let maxCapacity = 0;
      
      groupMembers.forEach(member => {
        const assignment = assignments.find(a => a.hotelId._id === member.hotelId);
        const room = assignment.logicalRooms.find(r => r.logicalRoomId === member.roomId);
        const availableSpace = room.maxCapacity - room.assignedClients.length + 1; // +1 car on enlève ce client
        
        if (availableSpace >= groupMembers.length && availableSpace > maxCapacity) {
          maxCapacity = availableSpace;
          bestRoom = {
            hotelId: member.hotelId,
            hotelName: member.hotelName,
            roomId: member.roomId,
            assignment: assignment,
            room: room
          };
        }
      });
      
      if (bestRoom) {
        // Déplacer tous les membres vers la meilleure chambre
        const membersToMove = groupMembers.filter(m => 
          m.hotelId !== bestRoom.hotelId || m.roomId !== bestRoom.roomId
        );
        
        membersToMove.forEach(member => {
          // Retirer de l'ancienne chambre
          const oldAssignment = assignments.find(a => a.hotelId._id === member.hotelId);
          const oldRoom = oldAssignment.logicalRooms.find(r => r.logicalRoomId === member.roomId);
          const clientIndex = oldRoom.assignedClients.findIndex(c => 
            c.clientId._id === member.client.clientId._id
          );
          
          if (clientIndex !== -1) {
            oldRoom.assignedClients.splice(clientIndex, 1);
            
            // Ajouter à la nouvelle chambre
            bestRoom.room.assignedClients.push({
              ...member.client,
              assignedAt: new Date(),
              assignmentType: 'auto_reunite'
            });
            
            changes.push({
              type: 'GROUP_REUNITE',
              clientId: member.client.clientId._id,
              clientName: `${member.client.clientId.firstName} ${member.client.clientId.lastName}`,
              groupName: separatedGroup.groupName,
              from: {
                hotelId: member.hotelId,
                hotelName: member.hotelName,
                roomId: member.roomId
              },
              to: {
                hotelId: bestRoom.hotelId,
                hotelName: bestRoom.hotelName,
                roomId: bestRoom.roomId
              }
            });
          }
        });
      }
    }
  });
  
  return {
    changes,
    groupsProcessed: separatedGroups.length,
    clientsMoved: changes.length
  };
};

// Fonction pour balancer automatiquement les assignations entre hôtels
export const autoBalanceHotels = (assignments) => {
  const changes = [];
  const hotelStats = [];
  
  // Calculer les statistiques de chaque hôtel
  assignments.forEach(assignment => {
    let totalCapacity = 0;
    let totalAssigned = 0;
    
    assignment.logicalRooms.forEach(room => {
      totalCapacity += room.maxCapacity;
      totalAssigned += room.assignedClients.length;
    });
    
    hotelStats.push({
      hotelId: assignment.hotelId._id,
      hotelName: assignment.hotelId.name,
      assignment: assignment,
      totalCapacity,
      totalAssigned,
      occupancyRate: totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0,
      availableSpots: totalCapacity - totalAssigned
    });
  });
  
  // Trier par taux d'occupation
  hotelStats.sort((a, b) => a.occupancyRate - b.occupancyRate);
  
  const underUtilized = hotelStats.filter(h => h.occupancyRate < 60);
  const overUtilized = hotelStats.filter(h => h.occupancyRate > 90);
  
  // Déplacer des clients des hôtels sur-utilisés vers les sous-utilisés
  overUtilized.forEach(overHotel => {
    underUtilized.forEach(underHotel => {
      if (underHotel.availableSpots > 0) {
        // Trouver des clients à déplacer (priorité aux clients solo)
        const clientsToMove = [];
        
        overHotel.assignment.logicalRooms.forEach(room => {
          room.assignedClients.forEach(assignedClient => {
            if (assignedClient.clientId.clientType === 'Solo' && 
                clientsToMove.length < Math.min(3, underHotel.availableSpots)) {
              clientsToMove.push({
                client: assignedClient,
                room: room
              });
            }
          });
        });
        
        // Effectuer les déplacements
        clientsToMove.forEach(moveData => {
          // Trouver une chambre disponible dans l'hôtel sous-utilisé
          const availableRoom = underHotel.assignment.logicalRooms.find(room => 
            room.assignedClients.length < room.maxCapacity
          );
          
          if (availableRoom) {
            // Retirer de l'ancienne chambre
            const oldRoomIndex = moveData.room.assignedClients.findIndex(c => 
              c.clientId._id === moveData.client.clientId._id
            );
            
            if (oldRoomIndex !== -1) {
              moveData.room.assignedClients.splice(oldRoomIndex, 1);
              
              // Ajouter à la nouvelle chambre
              availableRoom.assignedClients.push({
                ...moveData.client,
                assignedAt: new Date(),
                assignmentType: 'auto_balance'
              });
              
              changes.push({
                type: 'HOTEL_BALANCE',
                clientId: moveData.client.clientId._id,
                clientName: `${moveData.client.clientId.firstName} ${moveData.client.clientId.lastName}`,
                from: {
                  hotelId: overHotel.hotelId,
                  hotelName: overHotel.hotelName,
                  occupancyRate: overHotel.occupancyRate
                },
                to: {
                  hotelId: underHotel.hotelId,
                  hotelName: underHotel.hotelName,
                  occupancyRate: underHotel.occupancyRate
                }
              });
              
              // Mettre à jour les disponibilités
              overHotel.availableSpots++;
              underHotel.availableSpots--;
            }
          }
        });
      }
    });
  });
  
  return {
    changes,
    hotelStats: hotelStats.map(h => ({
      hotelName: h.hotelName,
      occupancyRate: h.occupancyRate,
      totalAssigned: h.totalAssigned,
      totalCapacity: h.totalCapacity
    })),
    balanceImprovement: changes.length > 0
  };
};

// Fonction pour créer un résumé exécutif
export const createExecutiveSummary = (assignments, clients, eventName) => {
  const report = generateDetailedReport(assignments, clients, eventName);
  
  return {
    title: `Résumé Exécutif - Assignations ${eventName}`,
    date: new Date().toLocaleDateString('fr-FR'),
    keyMetrics: {
      totalParticipants: report.summary.totalClients,
      assignmentRate: `${Math.round((report.summary.assignedClients / report.summary.totalClients) * 100)}%`,
      hotelCount: report.summary.totalHotels,
      occupancyRate: `${report.summary.occupancyRate}%`,
      qualityScore: `${report.summary.qualityScore}/100`
    },
    status: {
      level: report.summary.qualityScore >= 80 ? 'Excellent' : 
             report.summary.qualityScore >= 60 ? 'Bon' : 
             report.summary.qualityScore >= 40 ? 'Moyen' : 'Nécessite des améliorations',
      color: report.summary.qualityScore >= 80 ? 'success' : 
             report.summary.qualityScore >= 60 ? 'info' : 
             report.summary.qualityScore >= 40 ? 'warning' : 'danger'
    },
    highlights: [
      `${report.summary.assignedClients} participants assignés avec succès`,
      `Répartition sur ${report.summary.totalHotels} hôtels différents`,
      `Taux d'occupation global de ${report.summary.occupancyRate}%`,
      report.qualityMetrics.conflicts === 0 ? 
        'Aucun conflit détecté' : 
        `${report.qualityMetrics.conflicts} conflit(s) à résoudre`
    ],
    criticalIssues: report.qualityMetrics.criticalIssues,
    recommendations: report.issues.recommendations.slice(0, 3), // Top 3 recommandations
    nextSteps: generateNextSteps(report)
  };
};

// Fonction pour générer les prochaines étapes
export const generateNextSteps = (report) => {
  const steps = [];
  
  if (report.qualityMetrics.criticalIssues > 0) {
    steps.push({
      priority: 1,
      action: 'Résoudre immédiatement les conflits critiques',
      timeline: 'Immédiat',
      responsible: 'Gestionnaire d\'événement'
    });
  }
  
  if (report.summary.unassignedClients > 0) {
    steps.push({
      priority: 2,
      action: `Assigner les ${report.summary.unassignedClients} clients restants`,
      timeline: '24h',
      responsible: 'Équipe d\'assignation'
    });
  }
  
  if (report.summary.occupancyRate < 70) {
    steps.push({
      priority: 3,
      action: 'Optimiser l\'utilisation des chambres',
      timeline: '48h',
      responsible: 'Gestionnaire d\'hébergement'
    });
  }
  
  steps.push({
    priority: 4,
    action: 'Validation finale avec les hôtels partenaires',
    timeline: '72h',
    responsible: 'Responsable partenariats'
  });
  
  return steps;
};

// Fonction utilitaire pour formatter les données pour les graphiques
export const formatDataForCharts = (assignments, clients) => {
  const report = generateAssignmentReport(assignments);
  
  return {
    occupancyByHotel: {
      labels: report.occupancyByHotel.map(h => h.hotelName),
      datasets: [{
        label: 'Taux d\'occupation (%)',
        data: report.occupancyByHotel.map(h => h.occupancyRate),
        backgroundColor: report.occupancyByHotel.map(h => 
          h.occupancyRate >= 90 ? '#dc3545' :
          h.occupancyRate >= 70 ? '#ffc107' : '#28a745'
        )
      }]
    },
    clientTypeDistribution: {
      labels: Object.keys(report.clientTypeDistribution),
      datasets: [{
        data: Object.values(report.clientTypeDistribution),
        backgroundColor: [
          '#007bff', // Solo
          '#17a2b8', // Groupe  
          '#ffc107', // VIP
          '#dc3545', // Influenceur
          '#6c757d'  // Staff
        ]
      }]
    },
    genderDistribution: {
      labels: Object.keys(report.genderDistribution),
      datasets: [{
        data: Object.values(report.genderDistribution),
        backgroundColor: ['#007bff', '#dc3545', '#6c757d']
      }]
    },
    roomTypeDistribution: {
      labels: Object.keys(report.roomTypeDistribution),
      datasets: [{
        label: 'Nombre de chambres',
        data: Object.keys(report.roomTypeDistribution).map(type => 
          report.roomTypeDistribution[type].count
        ),
        backgroundColor: '#17a2b8'
      }, {
        label: 'Clients assignés',
        data: Object.keys(report.roomTypeDistribution).map(type => 
          report.roomTypeDistribution[type].assigned
        ),
        backgroundColor: '#28a745'
      }]
    }
  };
};

// Fonction pour exporter les données vers différents formats
export const exportData = {
  // Export CSV détaillé
  toCSV: (assignments, eventName) => exportAssignmentToCSV(assignments, eventName),
  
  // Export JSON pour backup
  toJSON: (assignments, clients, eventName) => {
    const data = {
      meta: {
        eventName,
        exportDate: new Date().toISOString(),
        version: '1.0'
      },
      assignments,
      clients,
      summary: generateAssignmentReport(assignments)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_${eventName}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
  
  // Export PDF (nécessite une librairie comme jsPDF)
  toPDF: async (assignments, clients, eventName) => {
    try {
      // Import dynamique pour éviter d'augmenter la taille du bundle
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      const report = generateDetailedReport(assignments, clients, eventName);
      
      // Titre
      pdf.setFontSize(20);
      pdf.text(`Rapport d'assignation - ${eventName}`, 20, 30);
      
      // Résumé
      pdf.setFontSize(14);
      pdf.text('Résumé', 20, 50);
      pdf.setFontSize(10);
      pdf.text(`Total clients: ${report.summary.totalClients}`, 20, 65);
      pdf.text(`Clients assignés: ${report.summary.assignedClients}`, 20, 75);
      pdf.text(`Taux d'occupation: ${report.summary.occupancyRate}%`, 20, 85);
      pdf.text(`Score qualité: ${report.summary.qualityScore}/100`, 20, 95);
      
      // Statistiques par hôtel
      let yPosition = 110;
      pdf.setFontSize(14);
      pdf.text('Répartition par hôtel', 20, yPosition);
      yPosition += 15;
      
      report.statistics.byHotel.forEach(hotel => {
        pdf.setFontSize(10);
        pdf.text(`${hotel.hotelName}: ${hotel.totalAssigned}/${hotel.totalCapacity} (${hotel.occupancyRate}%)`, 20, yPosition);
        yPosition += 10;
        
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
      
      pdf.save(`rapport_assignation_${eventName}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erreur export PDF:', error);
      throw new Error('Impossible d\'exporter en PDF. Vérifiez que la librairie jsPDF est installée.');
    }
  }
};

// Fonction pour importer des assignations depuis un backup JSON
export const importFromBackup = (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Validation de la structure
    if (!data.meta || !data.assignments || !data.clients) {
      throw new Error('Format de fichier invalide');
    }
    
    // Validation de la version
    if (data.meta.version !== '1.0') {
      console.warn('Version de backup différente détectée');
    }
    
    return {
      success: true,
      data: {
        eventName: data.meta.eventName,
        assignments: data.assignments,
        clients: data.clients,
        exportDate: data.meta.exportDate
      },
      message: `Backup importé avec succès (${data.clients.length} clients, ${data.assignments.length} hôtels)`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Erreur lors de l\'import du backup'
    };
  }
};

// Fonctions utilitaires pour les API calls
export const assignmentAPI = {
  // Sauvegarder les assignations
  save: async (eventId, assignments) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ assignments })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur sauvegarde assignations:', error);
      throw error;
    }
  },
  
  // Charger les assignations
  load: async (eventId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur chargement assignations:', error);
      throw error;
    }
  },
  
  // Assignation automatique
  autoAssign: async (eventId, options = {}) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${eventId}/auto-assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'assignation automatique');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur assignation automatique:', error);
      throw error;
    }
  },
  
  // Optimiser les assignations
  optimize: async (eventId, assignments) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/assignments/${eventId}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ assignments })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'optimisation');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erreur optimisation assignations:', error);
      throw error;
    }
  }
};

// Constantes utiles
export const ASSIGNMENT_CONSTANTS = {
  CLIENT_TYPES: ['Solo', 'Groupe', 'VIP', 'Influenceur', 'Staff'],
  GENDERS: ['Homme', 'Femme', 'Autre'],
  ROOM_TYPES: ['Simple', 'Double', 'Triple', 'Quadruple', 'Suite', 'Dortoir'],
  ASSIGNMENT_TYPES: ['manual', 'auto', 'auto_reunite', 'auto_balance'],
  PRIORITY_LEVELS: ['critical', 'high', 'medium', 'low'],
  CONFLICT_TYPES: [
    'MIXED_GENDER_NOT_ALLOWED',
    'OVER_CAPACITY', 
    'VIP_IN_REGULAR_ROOM',
    'GROUP_SEPARATED'
  ]
};

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Session expirée. Veuillez vous reconnecter.',
  VALIDATION_ERROR: 'Données invalides. Vérifiez les informations saisies.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  NOT_FOUND: 'Ressource non trouvée.',
  CONFLICT: 'Conflit détecté. L\'opération ne peut pas être effectuée.',
  INSUFFICIENT_CAPACITY: 'Capacité insuffisante pour cette assignation.',
  INVALID_ASSIGNMENT: 'Assignation invalide selon les règles définies.'
};

export default {
  calculateOccupancyRate,
  getRoomStatusColor,
  getClientTypeColor,
  getGenderColor,
  getGenderIcon,
  formatPhoneNumber,
  validateRoomAssignment,
  generateRoomSuggestions,
  generateAssignmentReport,
  exportAssignmentToCSV,
  getAssignmentQualityScore,
  findConflicts,
  optimizeAssignments,
  calculateClientCompatibility,
  findBestRoomForClient,
  validateFullAssignment,
  autoAssignUnassignedClients,
  optimizeAssignmentsByGenetic,
  generateDetailedReport,
  generateRecommendations,
  findSeparatedGroups,
  findVIPIssues,
  calculateHotelDistance,
  autoReuniteGroups,
  autoBalanceHotels,
  createExecutiveSummary,
  generateNextSteps,
  formatDataForCharts,
  exportData,
  importFromBackup,
  assignmentAPI,
  ASSIGNMENT_CONSTANTS,
  ERROR_MESSAGES
};
