import React from 'react';

const makeInput = (type, name, isRequired, onChange, value) => (
  <label className="inquiryLabel" htmlFor={name}>
    {isRequired ? '* ' : ''}
    {name[0].toUpperCase() + name.slice(1)}
    <br />
    <input id={name} type={type} name={name} onChange={onChange} required={isRequired} value={value} />
  </label>
);
export default { makeInput };
