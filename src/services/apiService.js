const axios = require("axios");

const apiService = {
  async getProducts() {
    try {
      const response = await axios.get("/api/v1/products");
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};

module.exports = apiService;
