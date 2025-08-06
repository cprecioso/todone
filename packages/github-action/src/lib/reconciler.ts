import type { Primitive } from "type-fest";

const setSubtract = <T>(a: Iterable<T>, b: Iterable<T>) => {
  const result = new Set(a);
  for (const item of b) {
    result.delete(item);
  }
  return result;
};

const setIntersect = <T>(a: Iterable<T>, b: Iterable<T>) => {
  const result = new Set<T>();
  const setA = new Set(a);
  for (const item of b) {
    if (setA.has(item)) {
      result.add(item);
    }
  }
  return result;
};

export const reconcile = <
  CurrentItem,
  DesiredItem,
  Id extends Primitive,
  const Props extends Primitive & keyof CurrentItem & keyof DesiredItem,
>(
  currentState: Map<Id, CurrentItem>,
  desiredState: Map<Id, DesiredItem>,
  trackedProps: readonly Props[],
) => {
  const addedIds = setSubtract(desiredState.keys(), currentState.keys());
  const removedIds = setSubtract(currentState.keys(), desiredState.keys());
  const keptIds = setIntersect(currentState.keys(), desiredState.keys());

  type ChangeObj = Partial<Pick<DesiredItem, Props>>;
  const changes = new Map<
    Id,
    { current: CurrentItem; desired: DesiredItem; changes?: ChangeObj }
  >();
  if (trackedProps.length !== 0) {
    for (const id of keptIds) {
      const currentItem = currentState.get(id)!;
      const desiredItem = desiredState.get(id)!;

      const changeObj = {} as ChangeObj;

      let hasChanges = false;
      for (const prop of trackedProps) {
        if (!Object.is(currentItem[prop], desiredItem[prop])) {
          hasChanges = true;
          changeObj[prop] = desiredItem[prop];
        }
      }

      changes.set(id, {
        current: currentItem,
        desired: desiredItem,
        changes: hasChanges ? changeObj : undefined,
      });
    }
  }

  return {
    added: new Map(
      Array.from(addedIds).map((id) => [id, desiredState.get(id)!]),
    ),
    removed: new Map(
      Array.from(removedIds).map((id) => [id, currentState.get(id)!]),
    ),
    changes,
  };
};
