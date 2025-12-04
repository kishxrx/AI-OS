package property.lifecycle

# Allow property creation when the requester has the required permission.
allow_create {
  input.user.permissions[_] == "property:create"
}

# Allow logical deletion only when the requester has the logical delete permission.
allow_logical_delete {
  input.user.permissions[_] == "property:delete:logical"
}

# Allow hard deletion only when the requester has the hard delete permission.
allow_hard_delete {
  input.user.permissions[_] == "property:delete:hard"
}
