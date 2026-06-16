function buildFormState(validationErrors = [], initialFields = {}) {
  const fieldErrors = {};
  const generalErrors = [];

  validationErrors.forEach((error) => {
    if (error.path && !fieldErrors[error.path]) {
      fieldErrors[error.path] = error.msg;
      return;
    }

    generalErrors.push(error.msg);
  });

  return {
    fieldErrors,
    generalErrors,
    hasFieldError(fieldName) {
      return Object.prototype.hasOwnProperty.call(fieldErrors, fieldName);
    },
    getFieldError(fieldName) {
      return fieldErrors[fieldName] || "";
    },
    fields: initialFields,
  };
}

module.exports = {
  buildFormState,
};
