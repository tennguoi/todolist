const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      validate: {
        isUUID: 4
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: {
          msg: "Please enter a valid email address"
        },
        notEmpty: {
          msg: "Email is required"
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Name is required"
        },
        len: {
          args: [2, 100],
          msg: "Name must be between 2 and 100 characters"
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        if (value) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(value, salt);
          this.setDataValue('password_hash', hash);
        }
      }
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: {
        name: 'users_google_id_unique',
        msg: 'Google ID already associated with another account'
      }
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: "Avatar must be a valid URL"
        }
      }
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeValidate: (user) => {
        if (!user.id) {
          user.id = uuidv4();
        }
      },
      beforeCreate: (user) => {
        // Kiểm tra bắt buộc mật khẩu cho người dùng không phải Google
        if (!user.google_id && !user.password_hash) {
          throw new Error("Password is required for non-Google users");
        }
      },
      beforeUpdate: (user) => {
        // Ngăn cập nhật google_id nếu đã có
        if (user.changed('google_id') && user.previous('google_id')) {
          throw new Error("Google ID cannot be changed once set");
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password_hash'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password_hash'] }
      }
    }
  }
);

// Instance methods
User.prototype.validatePassword = async function (password) {
  if (!this.password_hash) return false;
  return bcrypt.compareSync(password, this.password_hash);
};

User.prototype.safeUpdate = async function (updates) {
  const allowedFields = ['name', 'avatar', 'password_hash'];
  const updateData = {};
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  }
  
  return this.update(updateData);
};

// Class methods
User.findByEmail = async function (email) {
  return this.findOne({ where: { email } });
};

User.findByGoogleId = async function (googleId) {
  return this.findOne({ where: { google_id: googleId } });
};

// Override toJSON to always remove sensitive data
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  delete values.google_id;
  return values;
};

module.exports = User;