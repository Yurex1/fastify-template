export const getAccessToken = () => {
  const accessToken = localStorage.getItem("accessToken") || null;
  return accessToken;
};

export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const clearAccessToken = () => {
  localStorage.removeItem("accessToken");
};
