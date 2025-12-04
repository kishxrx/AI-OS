package property.lifecycle

# Allow if the user holds the correct permission.
allow_create if input.user.permissions[_] == "property:create"

allow_logical_delete if input.user.permissions[_] == "property:delete:logical"

allow_hard_delete if input.user.permissions[_] == "property:delete:hard"
