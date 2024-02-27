
function AppersonAutomotive(): JSX.Element {
  return (
    <div
      // eslint-disable-next-line max-len
      style={{ boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)', height: '500px' }}
    >
      <div>
        <img
          style={{ width: '95%', height: '455px' }}
          alt="Apperson Automotive Home Page"
          src="../static/imgs/AppersonAutomotive.png"
        />
        <br />
        <a
          href="https://www.appersonautomotive.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          Appersonautomotive.com
        </a>
      </div>
    </div>
  );
}

export default AppersonAutomotive;
