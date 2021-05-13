import React from 'react';
import { Select, TextInput } from 'react-materialize';

const makeDropdown = (htmlFor: string | undefined,
  value: string | undefined,
  onChange: (event: React.ChangeEvent<HTMLSelectElement>, isSelected: boolean) => void, options: string[]): JSX.Element => (
    <Select
      id={htmlFor}
      multiple={false}
      onChange={(event) => onChange(event, true)}
      options={{
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
);
const makeInput = (type: string | undefined,
  label: string, isRequired: boolean | undefined,
  onChange: ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined,
  value: string): JSX.Element => {
  let fId = label.toLowerCase();
  fId = fId.replace(/\s/g, '');
  const fIdArr = fId.split('(');
  // eslint-disable-next-line prefer-destructuring
  fId = fIdArr[0];
  return (
    <TextInput
      id={fId}
      placeholder={isRequired ? '* '.concat(label) : label}
      type={type}
      name={fId}
      onChange={onChange}
      value={value || ''}
    />
  );
};

export default { makeInput, makeDropdown };
