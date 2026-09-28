export const up = (pgm) => {
  pgm.addConstraint('users', 'users_phone_number_unique', {
    unique: 'phone_number',
  })
}

export const down = (pgm) => {
  pgm.dropConstraint('users', 'users_phone_number_unique')
}