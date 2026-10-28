import { useEffect, useRef, useState } from 'react';
import adminVenuesUtils, { type Ivenue, type IvenueUpdate } from 'src/containers/AdminVenues/admin-venues.utils';
import { formatVenueSaveOutcomeMessage, getExistingVenueWarning, validateVenueFields } from 'src/containers/AdminVenues/venue-shared.utils';

const emptyFields = { name: '', address: '', city: '', usState: 'VA', zipCode: '', website: '', location: undefined as IvenueUpdate['location'] };
export type GigVenueFieldsValue = typeof emptyFields;

export function useGigVenue(session: string | boolean | undefined, token: string) {
  const [fields, setFields] = useState(emptyFields);
  const [inventory, setInventory] = useState<Ivenue[] | null>(null);
  const [inventoryError, setInventoryError] = useState('');
  const [inventoryAttempt, setInventoryAttempt] = useState(0);
  const [outcomeMessage, setOutcomeMessage] = useState('');
  const saved = useRef<{ signature: string; id: string; message: string } | null>(null);

  useEffect(() => {
    setFields(emptyFields);
    setOutcomeMessage('');
    saved.current = null;
  }, [session, token]);

  useEffect(() => {
    let cancelled = false;
    setInventory(null);
    setInventoryError('');
    if (session && token) {
      adminVenuesUtils.fetchWarningVenues(token).then((venues) => {
        if (!cancelled) setInventory(venues);
      }).catch(() => {
        if (!cancelled) setInventoryError('Unable to check existing venues. Retry before creating a venue.');
      });
    }
    return () => { cancelled = true; };
  }, [session, token, inventoryAttempt]);

  const validation = validateVenueFields(fields, { mode: 'create' });
  const warning = getExistingVenueWarning({ ...fields, inventory: inventory || [], mode: 'create' });

  const save = async () => {
    if (!validation.valid) throw new Error(validation.error);
    if (!inventory) throw new Error('Existing venues have not been checked yet.');
    const payload: IvenueUpdate = {
      name: fields.name.trim(), address: fields.address.trim(), city: fields.city.trim(),
      usState: fields.usState, zipCode: fields.zipCode.trim(),
      website: validation.formattedWebsite, status: 'active',
      ...(fields.location ? { location: fields.location } : {}),
    };
    const signature = JSON.stringify(payload);
    if (saved.current?.signature === signature) return saved.current;
    const result = await adminVenuesUtils.createVenueWithOutcome(token, payload);
    if (!result.venue._id) throw new Error('Venue save did not return a venue ID.');
    const wasArchived = inventory.some((v) => v._id === result.venue._id && v.status === 'archived');
    const message = formatVenueSaveOutcomeMessage(result.outcome, wasArchived);
    saved.current = { signature, id: result.venue._id, message };
    setOutcomeMessage(message);
    return saved.current;
  };

  return {
    fields, setFields, validation, warning, inventoryError, outcomeMessage, save,
    ready: inventory !== null,
    retryInventory: () => setInventoryAttempt((attempt) => attempt + 1),
  };
}
