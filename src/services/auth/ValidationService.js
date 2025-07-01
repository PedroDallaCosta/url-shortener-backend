const bcrypt = require('bcrypt');

class ValidationService {
  async validPassword(password, hash){
    return await bcrypt.compare(password, hash);
  }
}

module.exports = ValidationService