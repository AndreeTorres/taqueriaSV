import { AppError } from "./app-error.js";

export const required = (value, field) => {
  if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
    throw new AppError(`El campo ${field} es obligatorio.`);
  }
};

export const positiveNumber = (value, field, allowZero = false) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0 || (!allowZero && numericValue === 0)) {
    throw new AppError(`El campo ${field} debe ser un número positivo válido.`);
  }
};

export const minValue = (value, min, field) => {
  const numericValue = Number(value);
  if (numericValue < min) {
    throw new AppError(`El campo ${field} debe ser mayor o igual a ${min}.`);
  }
};

export const maxValue = (value, max, field) => {
  const numericValue = Number(value);
  if (numericValue > max) {
    throw new AppError(`El campo ${field} debe ser menor o igual a ${max}.`);
  }
};

export const stringLength = (value, min, max, field) => {
  if (value.length < min || value.length > max) {
    throw new AppError(`El campo ${field} debe tener entre ${min} y ${max} caracteres.`);
  }
};

export const email = (value, field = "email") => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new AppError(`El campo ${field} debe ser un email válido.`);
  }
};

export const phone = (value, field = "teléfono") => {
  const phoneRegex = /^[\d\-\+\(\)\s]{7,}$/;
  if (!phoneRegex.test(value)) {
    throw new AppError(`El campo ${field} debe ser un número de teléfono válido.`);
  }
};

export const dateString = (value, field = "fecha") => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new AppError(`El campo ${field} debe ser una fecha válida.`);
  }
};

export const ensureArray = (value, field) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new AppError(`El campo ${field} debe contener al menos un elemento.`);
  }
};

export const enumValue = (value, allowedValues, field) => {
  if (!allowedValues.includes(value)) {
    throw new AppError(`El campo ${field} debe ser uno de: ${allowedValues.join(", ")}.`);
  }
};
