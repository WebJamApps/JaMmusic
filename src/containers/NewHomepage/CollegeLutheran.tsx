function CollegeLutheran(): JSX.Element {
  return (
    <div
    // className="elevation2 project"
      // eslint-disable-next-line max-len
      style={{ boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)', height: '500px' }}
    >
      <h4>College Lutheran Church</h4>
      <img
        style={{ width: '95%', height: '385px' }}
        alt="College Lutheran Church Homepage"
        src="https://dl.dropboxusercontent.com/s/354maifx0dkzt9s/Screenshot%20from%202019-02-22%2016-01-50.png?dl=0"
      />
      <br />
      <a
        href="https://www.collegelutheran.org"
        target="_blank"
        rel="noreferrer noopener"
      >
        Collegelutheran.org
      </a>
    </div>
  );
}

export default CollegeLutheran;
