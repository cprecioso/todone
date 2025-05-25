copy_from_root(field, 'author').
copy_from_root(field, 'license').
copy_from_root(field, 'repository').
copy_from_root(field, 'bugs').
copy_from_root(_, _) :- false.

% Copy fields from root
gen_enforced_field(WorkspaceCwd, FieldPath, FieldValue) :-
  workspace(WorkspaceCwd),
  WorkspaceCwd \= '.',
  copy_from_root(field, FieldPath),
  workspace_field('.', FieldPath, FieldValue).

% Copy dependencies from root
gen_enforced_dependency(WorkspaceCwd, DepName, DepVersion, DepType) :-
  workspace(WorkspaceCwd),
  WorkspaceCwd \= '.',
  dependency_type(DepType),
  copy_from_root(DepType, DepName),
  workspace_has_dependency('.', DepName, DepVersion, DepType).

% If you have the same dependency as the root, use the same version
gen_enforced_dependency(WorkspaceCwd, DepName, DepVersion, DepType) :-
  workspace_has_dependency('.', DepName, DepVersion, _),
  workspace_has_dependency(WorkspaceCwd, DepName, _, DepType).
