import { useEffect } from 'react';
import commonUtils from 'src/lib/utils';

const CONTACT_EMAIL = 'web.jam.adm@gmail.com';

function WebJamSection() {
  return (
    <section>
      <h4>What web-jam.com collects</h4>
      <h5>Contact and booking forms</h5>
      <p>
        When you send our contact form, we receive your name, email address, phone number, country, state,
        zip code and message. The booking form also asks for the event date, the type of event and the
        venue address. The form is emailed to Josh and Maria Sherman, and we use it to answer you and to
        arrange performances. The website does not save it in its database.
      </p>
      <p>
        The venue address you type on the booking form is sent to Google to suggest and check addresses.
        The server also uses your IP address to limit how many forms can be sent from one place, and
        checks submissions for spam.
      </p>
      <h5>Signing in with Google</h5>
      <p>
        You can browse without signing in. If you sign in, Google gives us your name and email address.
        We store them with your account, along with the role that controls what you can use. Your browser
        keeps your sign-in token and account details in its local storage. The token expires after 24 hours.
      </p>
      <h5>Tips and purchases</h5>
      <p>
        The tip jar uses Stripe, so payment details are entered with Stripe and not on our server. Links
        for buying our music take you to other companies, such as Amazon and Apple.
      </p>
      <h5>Venue contact records</h5>
      <p>
        To book performances, we keep business contact details for venues, such as names, addresses,
        email addresses and phone numbers, and a record of the booking emails we send them. These come
        from public listings and from our contact with the venues.
      </p>
    </section>
  );
}

function BothSitesSections() {
  return (
    <>
      <section>
        <h4>What both websites do</h4>
        <ul>
          <li>Your browser remembers your light or dark display choice and some page data.</li>
          <li>Our website code includes no advertising or analytics trackers.</li>
          <li>The services that host our websites keep server logs, which can include your IP address.</li>
        </ul>
      </section>
      <section>
        <h4>Services from other companies</h4>
        <p>
          Parts of our pages come from other companies, which receive your IP address and browser details
          when those parts load and may set their own cookies. Their own privacy policies apply. These
          include Google (fonts, sign-in and maps), Font Awesome (icons), Plyr (the media player),
          YouTube, SoundCloud and Spotify (music and video), Stripe (the tip jar), and Dropbox and Amazon
          (some pictures and recordings).
        </p>
      </section>
      <section>
        <h4>Instagram and Facebook</h4>
        <p>
          We use our own tool to post our gig announcements to our Instagram and Facebook accounts. A post
          may tag the venue and Maria Sherman. The tool does not collect information about the people who
          see or react to those posts.
        </p>
      </section>
    </>
  );
}

export function PrivacyPolicy() {
  useEffect(() => commonUtils.setTitleAndScroll('Privacy Policy', window.screen.width), []);

  return (
    <div className="privacy-policy" style={{ margin: 'auto', padding: '6px 12px', maxWidth: '800px' }}>
      <h3 style={{ textAlign: 'center' }}>Privacy Policy</h3>
      <p style={{ textAlign: 'center' }}>Last updated November 26, 2026</p>
      <p>
        This policy covers two websites run by Web Jam LLC: web-jam.com and joshandmariamusic.com, the
        Josh &amp; Maria Music site.
      </p>
      <section>
        <h4>What joshandmariamusic.com collects</h4>
        <p>
          This site shows our music, pictures and gigs without asking you to sign in. Its links for the
          song list, booking, buying music and tips open web-jam.com, so the web-jam.com section below
          applies to them.
        </p>
      </section>
      <WebJamSection />
      <BothSitesSections />
      <section>
        <h4>Questions and requests</h4>
        <p>
          To ask what information we hold about you, or to ask us to delete it, email
          {' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          {' '}
          or use the contact form on
          {' '}
          <a href="https://web-jam.com">web-jam.com</a>
          .
        </p>
      </section>
    </div>
  );
}
