export const isString = (val) => {
  return typeof val == 'string';
};

export const isNumber = (val) => {
  return typeof val == 'number';
};

export const isBoolean = (val) => {
  return typeof val == 'boolean';
};

export const isObject = (val) => {
  return typeof val == 'object' && val !== null && !Array.isArray(val);
};

export const isArray = (val) => {
  return Array.isArray(val);
};

export const isDate = (val) => {
  return val instanceof Date;
};

export const isEmail = (val) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof val === 'string' && emailRegex.test(val);
};

export const isNonEmptyString = (val) => {
  return typeof val === 'string' && val.trim().length > 0;
};

export const isPositiveNumber = (val) => {
  return typeof val === 'number' && val > 0;
};

export const isNonNegativeNumber = (val) => {
  return typeof val === 'number' && val >= 0;
};

export const isValidPassword = (val) => {
  // Exemplo de validação de senha: pelo menos 8 caracteres, incluindo letras e números
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return typeof val === 'string' && passwordRegex.test(val);
};

export default {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isDate,
  isEmail,
  isNonEmptyString,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidPassword,
};
