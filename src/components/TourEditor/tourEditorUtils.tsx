import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';

const editor = (venue: string, comp:any): JSX.Element => (
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

const tourButtons = (comp:any): JSX.Element => {
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

// function createTourApi(tour1:any): boolean {
//   const { scc, auth } = this.props;
//   const tour:any = { ...tour1 };
//   console.log(tour1.date);
//   const timestring = tour1.time ? tour1.time.toISOString() : '';
//   if (timestring){
//     const timepart = timestring.split('T')[1];
//     const correctedIso = `${tour1.date}T${timepart}`;
//     tour.datetime = correctedIso;
//   }
//   console.log(tour.datetime);
//   const m = moment(tour.date, 'YYYY-MM-DD');
//   tour.date = m.format('ll');
//   console.log(tour.time?.toLocaleTimeString());
//   tour.time = tour.time ? tour.time.toLocaleTimeString() : '';
//   console.log(auth.token);
//   scc.transmit('newTour', { tour, token: auth.token });
//   this.setState({ redirect: true });
//   return true;
// }

// function createTour(): boolean {
//   const {
//     date, time, location, venue, tickets, more,
//   } = this.state;
//   const tour = {
//     date, time, location, venue, tickets, more,
//   };
//   return this.createTourApi(tour);
// }

// function editTourAPI(): boolean {
//   const {
//     date, time, location, venue, tickets, more,
//   } = this.state;
//   const { editTour, scc, auth } = this.props;
//   const tour = {
//     date, time, location, venue, tickets, more, datetime: date,
//   };
//   const m = moment(tour.date, 'YYYY-MM-DD');
//   tour.date = m.format('ll');
//   if (tour.time instanceof Date){
//     const timestring = tour.time.toISOString();
//     const timepart = timestring.split('T')[1];
//     const correctedIso = `${tour.date}T${timepart}`;
//     tour.datetime = correctedIso;
//   }
//   scc.transmit('editTour', { tour, token: auth.token, tourId: editTour._id });
//   this.resetEditForm(null);
//   this.setState({ redirect: true });
//   return true;
// }

export default { editor, tourButtons };
