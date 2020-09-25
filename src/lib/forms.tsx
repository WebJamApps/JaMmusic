import React from 'react';
import 'materialize-css';
import { Select } from 'react-materialize';

const makeDropdown = (htmlFor: string | undefined,
  labelText: React.ReactNode, value: string | undefined,
  onChange: (event: React.ChangeEvent<HTMLSelectElement>, isSelected: boolean) => void, options: string[]): JSX.Element => (
    <label htmlFor={htmlFor} style={{ paddingTop: '12px' }} id={htmlFor}>
      {labelText}
      <br />
      <Select
        id={htmlFor}
        multiple={false}
        onChange={(event) => onChange(event, true)}
        options={{
          classes: '',
          dropdownOptions: {
            alignment: 'left',
            autoTrigger: true,
            closeOnClick: true,
            constrainWidth: true,
            coverTrigger: true,
            hover: false,
            inDuration: 150,
            outDuration: 250,
          },
        }}
        value={value}
      >
        {
          options.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
        }
      </Select>

      {/* <select id={htmlFor} value={value} onChange={(event) => onChange(event, true)}>
        {
          options.map((cv) => <option id={cv} key={cv} value={cv}>{cv}</option>)
        }
      </select> */}
    </label>
);
const makeInput = (type: string | undefined,
  label: string, isRequired: boolean | undefined,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined,
  value: string, width?: string): JSX.Element => {
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  const fIdArr = fId.split('(');
  // eslint-disable-next-line prefer-destructuring
  fId = fIdArr[0];
  return (
    <label className="inquiryLabel" htmlFor={fId}>
      {isRequired ? '* ' : ''}
      {label}
      <br />
      <input
        style={{ paddingLeft: 0, minWidth: 'inherit', width }}
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
export default { makeInput, makeDropdown };
