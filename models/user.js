'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Course, {
        as: 'user',
        foreignKey: {
          fieldName: 'userId',
          allowNull: false,
        }
      });
    }
  };
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type:  DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'First name is required'
        },
        notEmpty: {
          msg: 'Please provide a valid first name'
        }
      }
    },
    lastName: {
      type:  DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Last name is required'
        },
        notEmpty: {
          msg: 'Please provide a valid last name'
        }
      }
    },
    emailAddress: {
      type:  DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'The email you entered already exists'
      },
      validate: {
        notNull: {
          msg: 'Email Required'
        },
        isEmail: {
          msg: 'please provide a valid email address'
        }
      }
    },
    password: {
      type:  DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password Required'
        },
        notEmpty: {
          msg: 'please provide a password'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};