import { nothing } from 'lit'

/** Conditional rendering without a ternary: the template is built only when shown. */
export const whenPresent = <A>(condition: boolean, render: () => A): A | typeof nothing => {
  switch (condition) {
    case true:
      return render()
    case false:
      return nothing
  }
}
