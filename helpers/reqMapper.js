const userMapper = (user) => {
  const mappedUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    _id: user._id,
    __v: user.__v,
  };
  return mappedUser;
};

module.exports = userMapper;
