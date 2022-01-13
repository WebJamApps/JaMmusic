import { Editor } from '@tinymce/tinymce-react';

import type { MusicDashboard } from '../../containers/MusicDashboard';

const editor = (venue: string, comp:MusicDashboard): JSX.Element => (
  <div className="horiz-scroll">
    <div style={{ width: '850px', margin: 'auto' }}>
      <p style={{ marginBottom: 0 }}>* Venue</p>
      <Editor
        value={venue}
        apiKey={process.env.TINY_KEY}
        init={{
          height: 500,
          menubar: 'insert tools',
          menu: { format: { title: 'Format', items: 'forecolor backcolor' } },
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | bold italic backcolor forecolor |'
            + 'alignleft aligncenter alignright alignjustify |'
            + 'bullist numlist outdent indent | removeformat | help',
        }}
        onEditorChange={comp.handleEditorChange}
      />
    </div>
  </div>
);

const tourButtons = (comp: MusicDashboard): JSX.Element => {
  const { editTour } = comp.props;
  return (
    <div style={{ textAlign: 'left', marginTop: '10px', maxWidth: '85%' }}>
      <span style={{
        fontSize: '16px', marginRight: '20px', position: 'relative', display: 'inline-block',
      }}
      >
        <i>* Required</i>
      </span>
      {editTour._id ? (
        <button className="floatRight" type="button" id="cancel-edit-pic" onClick={comp.resetEditForm}>
          Cancel
        </button>
      ) : null}
      <button
        className="floatRight"
        disabled={comp.validateForm()}
        type="button"
        onClick={editTour._id ? comp.editTourAPI : comp.createTour}
      >
        {editTour._id ? 'Edit' : 'Create'}
        {' '}
        Tour
      </button>
    </div>
  );
};

export default { editor, tourButtons };
