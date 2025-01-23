import { useQueryClient } from '@tanstack/react-query';

const TokenProvider = () => {
  const queryClient = useQueryClient();
  const accessToken = queryClient.getQueryData<string>(['accessToken']) || '';

  return accessToken;
};

export default TokenProvider;
