import { apiService } from './api';

class HotelService {
  async getAllHotels() {
    return apiService.get('/hotels');
  }

  async getHotelById(id) {
    return apiService.get(`/hotels/${id}`);
  }

  async createHotel(hotelData) {
    return apiService.post('/hotels', hotelData);
  }

  async updateHotel(id, hotelData) {
    return apiService.put(`/hotels/${id}`, hotelData);
  }

  async deleteHotel(id) {
    return apiService.delete(`/hotels/${id}`);
  }

  async getStats() {
    return apiService.get('/hotels/stats');
  }
}

export const hotelService = new HotelService();
