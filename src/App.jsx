import { useState, useEffect } from "react";
import MainSketch from "./p5js-components/MainSketch";
import { Slider } from "baseui/slider";
import { FormControl } from "baseui/form-control";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Card } from "baseui/card";
import { ReactComponent as InfoIcon } from "/img/info.svg";
import { StatefulTooltip, PLACEMENT } from "baseui/tooltip";
import SliderFormControl from "./ui-components/SliderFormControl";

function App() {
  const [css, theme] = useStyletron();
  const [mutationProbability, setMutationProbability] = useState(0.1);
  const [mutationAmount, setMutationAmount] = useState(0.5);
  const [populationSize, setPopulationSize] = useState(50);
  const [timePerGeneration, setTimePerGeneration] = useState(5);
  const [timer, setTimer] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timer >= timePerGeneration) {
        setTimer(0);
      } else {
        setTimer(timer + 1);
      }

      setTotalTime(totalTime + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    console.table({
      mutationProbability: mutationProbability,
      mutationAmount: mutationAmount,
      populationSize: populationSize,
      timePerGeneration: timePerGeneration,
    });
  }, [mutationProbability, mutationAmount, populationSize, timePerGeneration]);

  const genesMutated = Math.round(mutationProbability * 68);
  const mutationProbabilityCaption = `${genesMutated} out of 68 car genes will be mutated.`;

  const mutationAmountString = Math.round(mutationAmount * 100);
  const mutationAmountCaption = `Each mutated gene will be changed by ${mutationAmountString}%.`;

  return (
    <div className="App">
      <MainSketch
        populationSize={populationSize}
        mutationProbability={mutationProbability}
        mutationAmount={mutationAmount}
        timePerGeneration={timePerGeneration}
        timer={timer}
      />

      <Block
        width={["100%", "100%", "800px"]} // see https://baseweb.design/components/block/#responsive-layouts
        //backgroundColor={"limegreen"}
      >
        <Block width="100%" display={"inline-flex"}>
          <SliderFormControl
            label={"Mutation Probability (%)"}
            infoToolTipContent={[
              "Determines the likelihood that a gene will mutate.",
              "🔼 Higher mutation probability ➡ large changes to the car's neural network",
              "🔽 Lower mutation probability ➡ fewer changes and slower evolution",
            ]}
            caption={mutationProbabilityCaption}
            slider={
              <Slider
                value={[mutationProbability * 100]}
                onChange={({ value }) =>
                  value && setMutationProbability(value[0] / 100)
                }
                min={0}
                max={100}
                step={1}
                valueToLabel={(value) => `${Math.round(value)}%`}
                width="100%"
              />
            }
          />

          <SliderFormControl
            label={"Mutation Amount (%)"}
            infoToolTipContent={[
              "Determines the amount that a gene will mutate.",
              "🔼 Higher mutation amount ➡ large changes to the car's neural network",
              "🔽 Lower mutation amount ➡ fewer changes and slower evolution",
            ]}
            caption={mutationAmountCaption}
            slider={
              <Slider
                value={[mutationAmount * 100]}
                onChange={({ value }) =>
                  value && setMutationAmount(value[0] / 100)
                }
                min={0}
                max={100}
                valueToLabel={(value) => `${Math.round(value)}%`}
              />
            }
          />
        </Block>

        <Block width="100%" display={"inline-flex"}>
          <SliderFormControl
            label={"Population Size"}
            infoToolTipContent={[
              "Determines the number of cars in the population.",
              "🔼 Higher population size ➡ quicker to find a solution but computationally expensive",
              "🔽 Lower population size ➡ slower to find a solution",
            ]}
            caption={""}
            slider={
              <Slider
                value={[populationSize]}
                onChange={({ value }) => value && setPopulationSize(value[0])}
                min={10}
                max={100}
                step={1}
                valueToLabel={(value) => `${value}`}
              />
            }
          />

          <SliderFormControl
            label={"Time Per Generation (s)"}
            infoToolTipContent={[
              "Determines the amount of time each generation will run for.",
              "🔼 Higher time per generation ➡ able to learn entire track but takes longer to evolve",
              "🔽 Lower time per generation ➡ able to learn small sections of track but evolves faster",
            ]}
            caption={""}
            slider={
              <Slider
                value={[timePerGeneration]}
                onChange={({ value }) =>
                  value && setTimePerGeneration(value[0])
                }
                min={5}
                max={60}
                step={1}
                valueToLabel={(value) => `${value}s`}
              />
            }
          />
        </Block>
      </Block>
    </div>
  );
}

export default App;
