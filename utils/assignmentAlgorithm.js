class AssignmentAlgorithm {
  constructor(clients, hotels, rules = {}) {
    this.clients = clients;
    this.hotels = hotels;
    this.rules = {
      allowMixedRooms: rules.allowMixedRooms || false,
      vipCanBeMixed: rules.vipCanBeMixed || true,
      keepGroupsTogether: rules.keepGroupsTogether || true,
      optimizeOccupancy: rules.optimizeOccupancy || true,
      ...rules
    };
    this.assignments = [];
    this.unassignedClients = [...clients];
  }

  async generateAssignments() {
    console.log(`🧠 Démarrage de l'algorithme d'assignation pour ${this.clients.length} clients`);
    
    // Étape 1: Trier les clients par priorité
    this.sortClientsByPriority();
    
    // Étape 2: Assigner les groupes en priorité
    await this.assignGroups();
    
    // Étape 3: Assigner les VIP restants
    await this.assignVIPs();
    
    // Étape 4: Assigner les clients solo
    await this.assignSoloClients();
    
    // Étape 5: Optimiser l'occupation
    if (this.rules.optimizeOccupancy) {
      await this.optimizeOccupancy();
    }
    
    return this.generateSummary();
  }

  sortClientsByPriority() {
    this.unassignedClients.sort((a, b) => {
      // Priorité 1: Type de client
      const typePriority = { 'VIP': 1, 'Influenceur': 2, 'Staff': 3, 'Groupe': 4, 'Solo': 5 };
      const typeDiff = typePriority[a.clientType] - typePriority[b.clientType];
      if (typeDiff !== 0) return typeDiff;
      
      // Priorité 2: Taille de groupe (plus grand en premier)
      if (a.groupName && b.groupName) {
        return b.groupSize - a.groupSize;
      }
      
      // Priorité 3: Groupes avant solo
      if (a.groupName && !b.groupName) return -1;
      if (!a.groupName && b.groupName) return 1;
      
      // Priorité 4: Genre (pour faciliter l'assignation)
      return a.gender.localeCompare(b.gender);
    });
  }

  async assignGroups() {
    console.log('👥 Assignation des groupes...');
    
    const groups = this.getGroupedClients();
    
    for (const [groupName, groupMembers] of Object.entries(groups)) {
      if (groupMembers.length === 0) continue;
      
      console.log(`Assignation du groupe "${groupName}" (${groupMembers.length} membres)`);
      
      // Vérifier si le groupe est mixte
      const genders = [...new Set(groupMembers.map(c => c.gender))];
      const isMixed = genders.length > 1;
      
      if (isMixed) {
        await this.assignMixedGroup(groupName, groupMembers);
      } else {
        await this.assignSameGenderGroup(groupName, groupMembers);
      }
    }
  }

  async assignMixedGroup(groupName, members) {
    // Groupes mixtes: chercher des chambres VIP ou séparer par genre
    const canStayTogether = members.every(m => m.clientType === 'VIP') || 
                           members.length === 2 && members.some(m => m.groupRelation === 'Couple');
    
    if (canStayTogether) {
      // Chercher une chambre assez grande pour tout le groupe
      const assignment = await this.findRoomForGroup(members, true); // allowMixed = true
      if (assignment) {
        this.assignments.push(assignment);
        this.removeAssignedClients(members);
        return;
      }
    }
    
    // Séparer par genre
    const menMembers = members.filter(m => m.gender === 'Homme');
    const womenMembers = members.filter(m => m.gender === 'Femme');
    
    if (menMembers.length > 0) {
      await this.assignSameGenderGroup(`${groupName} (Hommes)`, menMembers);
    }
    if (womenMembers.length > 0) {
      await this.assignSameGenderGroup(`${groupName} (Femmes)`, womenMembers);
    }
  }

  async assignSameGenderGroup(groupName, members) {
    const neededCapacity = members.length;
    
    // Chercher une chambre unique pour tout le groupe
    let assignment = await this.findRoomForGroup(members);
    if (assignment) {
      this.assignments.push(assignment);
      this.removeAssignedClients(members);
      return;
    }
    
    // Si impossible, diviser le groupe
    const chunks = this.chunkArray(members, 4); // Max 4 par chambre généralement
    
    for (const chunk of chunks) {
      assignment = await this.findRoomForGroup(chunk);
      if (assignment) {
        this.assignments.push(assignment);
        this.removeAssignedClients(chunk);
      }
    }
  }

  async findRoomForGroup(members, allowMixed = false) {
    const neededCapacity = members.length;
    const gender = allowMixed ? null : members[0].gender;
    
    for (const hotel of this.hotels) {
      for (const roomType of hotel.roomTypes) {
        if (roomType.capacity >= neededCapacity) {
          // Vérifier la disponibilité
          const availableRooms = await this.getAvailableRooms(hotel._id, roomType.type, neededCapacity);
          
          if (availableRooms > 0) {
            return {
              hotelId: hotel._id,
              hotelName: hotel.name,
              roomId: this.generateRoomId(hotel._id, roomType.type),
              roomType: roomType.type,
              capacity: roomType.capacity,
              clients: members.map(m => ({
                clientId: m._id,
                name: `${m.firstName} ${m.lastName}`,
                gender: m.gender,
                clientType: m.clientType,
                groupName: m.groupName
              })),
              isMixed: allowMixed && [...new Set(members.map(m => m.gender))].length > 1,
              utilizationRate: Math.round((neededCapacity / roomType.capacity) * 100)
            };
          }
        }
      }
    }
    
    return null;
  }

  async assignVIPs() {
    console.log('⭐ Assignation des VIP restants...');
    
    const vipClients = this.unassignedClients.filter(c => c.clientType === 'VIP');
    
    for (const vip of vipClients) {
      const assignment = await this.findBestRoomForClient(vip, true); // allowMixed pour VIP
      if (assignment) {
        this.assignments.push(assignment);
        this.removeAssignedClients([vip]);
      }
    }
  }

  async assignSoloClients() {
    console.log('🚶 Assignation des clients solo...');
    
    const soloClients = this.unassignedClients.filter(c => c.clientType === 'Solo');
    const menSolo = soloClients.filter(c => c.gender === 'Homme');
    const womenSolo = soloClients.filter(c => c.gender === 'Femme');
    
    // Assigner les hommes
    await this.assignSoloByGender(menSolo, 'Homme');
    
    // Assigner les femmes
    await this.assignSoloByGender(womenSolo, 'Femme');
  }

  async assignSoloByGender(clients, gender) {
    const chunks = this.chunkArray(clients, 4); // Groupes de 4 max
    
    for (const chunk of chunks) {
      const assignment = await this.findRoomForGroup(chunk);
      if (assignment) {
        this.assignments.push(assignment);
        this.removeAssignedClients(chunk);
      }
    }
  }

  async optimizeOccupancy() {
    console.log('🔧 Optimisation de l\'occupation...');
    
    // Identifier les chambres sous-utilisées
    const underutilizedRooms = this.assignments.filter(a => a.utilizationRate < 75);
    
    for (const room of underutilizedRooms) {
      const freeSpaces = room.capacity - room.clients.length;
      if (freeSpaces > 0) {
        // Chercher des clients compatibles non assignés
        const compatibleClients = this.findCompatibleClients(room, freeSpaces);
        
        if (compatibleClients.length > 0) {
          // Ajouter les clients à cette chambre
          room.clients.push(...compatibleClients.map(c => ({
            clientId: c._id,
            name: `${c.firstName} ${c.lastName}`,
            gender: c.gender,
            clientType: c.clientType,
            groupName: c.groupName
          })));
          
          room.utilizationRate = Math.round((room.clients.length / room.capacity) * 100);
          this.removeAssignedClients(compatibleClients);
        }
      }
    }
  }

  findCompatibleClients(room, maxCount) {
    const roomGenders = [...new Set(room.clients.map(c => c.gender))];
    const isRoomMixed = roomGenders.length > 1;
    
    return this.unassignedClients
      .filter(client => {
        // Règle de mixité
        if (!isRoomMixed && !roomGenders.includes(client.gender)) {
          return client.clientType === 'VIP'; // Seuls les VIP peuvent créer la mixité
        }
        
        // Règle de groupe (éviter de séparer les groupes)
        if (client.groupName) {
          const groupMembersInRoom = room.clients.filter(c => c.groupName === client.groupName);
          return groupMembersInRoom.length > 0;
        }
        
        return true;
      })
      .slice(0, maxCount);
  }

  generateSummary() {
    const totalAssigned = this.assignments.reduce((sum, a) => sum + a.clients.length, 0);
    const totalUnassigned = this.unassignedClients.length;
    const mixedRoomsCount = this.assignments.filter(a => a.isMixed).length;
    const averageOccupancy = this.assignments.length > 0 ? 
      Math.round(this.assignments.reduce((sum, a) => sum + a.utilizationRate, 0) / this.assignments.length) : 0;

    const warnings = [];
    
    // Générer les avertissements
    if (totalUnassigned > 0) {
      warnings.push(`${totalUnassigned} client(s) non assigné(s)`);
    }
    
    if (mixedRoomsCount > 0) {
      warnings.push(`${mixedRoomsCount} chambre(s) mixte(s) créée(s)`);
    }
    
    if (averageOccupancy < 60) {
      warnings.push(`Taux d'occupation moyen faible: ${averageOccupancy}%`);
    }

    return {
      success: true,
      totalAssigned,
      totalUnassigned,
      roomsUsed: this.assignments.length,
      mixedRooms: mixedRoomsCount,
      occupancyRate: averageOccupancy,
      assignments: this.assignments,
      unassignedClients: this.unassignedClients.map(c => ({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`,
        reason: this.getUnassignedReason(c)
      })),
      warnings,
      statistics: this.generateStatistics()
    };
  }

  generateStatistics() {
    const byType = {};
    const byGender = {};
    const byHotel = {};
    
    this.assignments.forEach(assignment => {
      assignment.clients.forEach(client => {
        // Par type
        byType[client.clientType] = (byType[client.clientType] || 0) + 1;
        
        // Par genre
        byGender[client.gender] = (byGender[client.gender] || 0) + 1;
        
        // Par hôtel
        byHotel[assignment.hotelName] = (byHotel[assignment.hotelName] || 0) + 1;
      });
    });

    return { byType, byGender, byHotel };
  }

  getUnassignedReason(client) {
    // Analyser pourquoi ce client n'a pas pu être assigné
    if (client.clientType === 'Groupe' && client.groupSize > 4) {
      return 'Groupe trop important (> 4 personnes)';
    }
    
    if (client.gender === 'Autre') {
      return 'Genre spécial nécessitant une assignation manuelle';
    }
    
    return 'Capacité insuffisante dans les hôtels';
  }

  // Méthodes utilitaires
  getGroupedClients() {
    const groups = {};
    this.unassignedClients
      .filter(c => c.groupName)
      .forEach(client => {
        if (!groups[client.groupName]) {
          groups[client.groupName] = [];
        }
        groups[client.groupName].push(client);
      });
    return groups;
  }

  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  generateRoomId(hotelId, roomType) {
    return `${hotelId}_${roomType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getAvailableRooms(hotelId, roomType, neededCapacity) {
    // Simuler le calcul de disponibilité
    // En réalité, cela devrait vérifier la base de données
    const hotel = this.hotels.find(h => h._id === hotelId);
    const roomTypeInfo = hotel?.roomTypes.find(rt => rt.type === roomType);
    
    if (!roomTypeInfo) return 0;
    
    // Logique simplifiée - à remplacer par une vraie vérification
    const assignedRoomsOfThisType = this.assignments.filter(a => 
      a.hotelId === hotelId && a.roomType === roomType
    ).length;
    
    return Math.max(0, roomTypeInfo.quantity - assignedRoomsOfThisType);
  }

  removeAssignedClients(clients) {
    const clientIds = clients.map(c => c._id);
    this.unassignedClients = this.unassignedClients.filter(c => !clientIds.includes(c._id));
  }
}

module.exports = AssignmentAlgorithm;
