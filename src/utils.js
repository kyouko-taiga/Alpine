const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)

/// Generates a GUID-like string.
export function guid() {
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

/// Modify a property of the given object, given its full path.
///
/// If `copying` is set to true, all intermediate objects traversed to reach to property to update
/// will be copied as well. This is useful if the updated object is intended to be stored in a
/// redux store, so as to properly invalidate reference equivalence.
export function setProperty(object, property, value, copying = false) {
  const result = copying ? { ...object } : object
  const components = property.split('.')
  let field = result
  for (let prop of components.slice(0, -1)) {
    if (copying) {
      field[prop] = { ...field[prop] }
    }
    field = field[prop]
  }
  field[components[components.length - 1]] = value
  return result
}
