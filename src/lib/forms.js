import React from 'react';

const makeInput = (type, label, isRequired, onChange, value) => {
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  return (
    <label className="inquiryLabel" htmlFor={fId}>
      {isRequired ? '* ' : ''}
      {label}
      <br />
      <input
        style={{ paddingLeft: 0 }}
        id={fId}
        type={type}
        name={fId}
        onChange={onChange}
        required={isRequired}
        value={value || ''}
      />
    </label>
  );
};
export default { makeInput };
