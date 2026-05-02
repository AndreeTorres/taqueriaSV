import React from "react";
import "../styles/form-input.css";

export const FormInput = ({
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  min,
  max,
  step,
  pattern,
  options, // para select
  ...props
}) => {
  const hasError = !!error;
  const inputId = `input-${label?.replace(/\s+/g, "-").toLowerCase()}`;

  if (type === "select") {
    return (
      <div className={`form-input-group ${hasError ? "has-error" : ""}`}>
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <select
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`form-select ${hasError ? "error" : ""}`}
          {...props}
        >
          <option value="">-- Seleccionar --</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && <span className="error-message">{error}</span>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className={`form-input-group ${hasError ? "has-error" : ""}`}>
        <label htmlFor={inputId}>
          {label}
          {required && <span className="required">*</span>}
        </label>
        <textarea
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-textarea ${hasError ? "error" : ""}`}
          rows={4}
          {...props}
        />
        {hasError && <span className="error-message">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`form-input-group ${hasError ? "has-error" : ""}`}>
      <label htmlFor={inputId}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${hasError ? "error" : ""}`}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        {...props}
      />
      {hasError && <span className="error-message">{error}</span>}
    </div>
  );
};
