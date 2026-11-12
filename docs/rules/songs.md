# songs rules



- **Explicit MongoDB `$unset` on URL/optional field removal in PUT requests**: When updating existing
  documents via `PUT` endpoints backed by Mongoose `findByIdAndUpdate`, omitting a field from the
  payload leaves the existing document field untouched in the database. To clear an optional field
  (such as removing a recording URL so an unrecorded song does not collide with a sparse unique index
  or retain a stale URL), the update payload must explicitly pass `$unset: { <field>: '' }` while
  deleting the key from the top-level payload (`delete payload.<field>`), rather than simply omitting it.
