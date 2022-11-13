import { Box, FlatList, useToast } from "native-base";
import { useEffect, useState } from "react";

import { api } from "../services/api";

import { Match, MatchProps } from "../components/Match";
import { Loading } from "./Loading";

interface Props {
  poolId: string;
}

export function Guesses({ poolId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [guessLoading, setGuessLoading] = useState(false);
  const [matches, setMatches] = useState<MatchProps[]>([]);
  const [firstTeamPoints, setFirstTeamPoints] = useState("");
  const [secondTeamPoints, setSecondTeamPoints] = useState("");

  const toast = useToast();

  async function fetchMatches() {
    try {
      setIsLoading(true);

      const response = await api.get(`/pools/${poolId}/matches`);
      setMatches(response.data.matches);
    } catch (err) {
      console.log(err);
      toast.show({
        title: "Não foi possível carregar os jogos deste bolão",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuessConfirm(matchId: string) {
    try {
      if (!firstTeamPoints.trim() || !secondTeamPoints.trim()) {
        return toast.show({
          title: "Informe o placar do palpite",
          placement: "top",
          bgColor: "red.500",
        });
      }

      setGuessLoading(true);

      await api.post(`/pools/${poolId}/matches/${matchId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      });

      toast.show({
        title: "Palpite enviado com sucesso",
        placement: "top",
        bgColor: "green.500",
      });

      setFirstTeamPoints("");
      setSecondTeamPoints("");

      setGuessLoading(false);

      fetchMatches();
    } catch (err) {
      console.log(err);
      setGuessLoading(false);

      if (err.response?.data?.message) {
        return toast.show({
          title: err.response.data.message,
          placement: "top",
          bgColor: "red.500",
        });
      }

      toast.show({
        title: "Não foi possível enviar o palpite",
        placement: "top",
        bgColor: "red.500",
      });
    }
  }

  useEffect(() => {
    fetchMatches();
  }, [poolId]);

  return (
    <Box>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Match
              data={item}
              setFirstTeamPoints={setFirstTeamPoints}
              setSecondTeamPoints={setSecondTeamPoints}
              onGuessConfirm={() => handleGuessConfirm(item.id)}
              isLoading={guessLoading}
            />
          )}
        />
      )}
    </Box>
  );
}
