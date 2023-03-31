import { Banner } from "baseui/banner";
import { Block } from "baseui/block";
import { Tag, KIND, VARIANT } from "baseui/tag";
import { LabelSmall } from "baseui/typography";

function InfoBanner({ generationNum, timePerGeneration, timer, totalTime }) {
  function formatSecondsToTimeString(seconds) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    if (minutes == 0) {
      return `${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }

  function InfoItem({ label, value, marginLeft }) {
    return (
      <Block
        display="flex"
        flexDirection={["column", "column", "row"]}
        alignItems="center"
        marginLeft={marginLeft}
      >
        <LabelSmall>{label}:</LabelSmall>
        <Tag closeable={false} kind={KIND.neutral} variant={VARIANT.solid}>
          {value}
        </Tag>
      </Block>
    );
  }

  return (
    <Banner>
      <Block width="100%" display="flex" alignItems="center">
        <InfoItem
          label="Generation"
          value={`#${generationNum}`}
          marginLeft="0px"
        />
        <InfoItem
          label="Time remaining"
          value={formatSecondsToTimeString(timePerGeneration - timer)}
          marginLeft="10px"
        />
        <InfoItem
          label="Total Simulation Time"
          value={formatSecondsToTimeString(totalTime)}
          marginLeft="auto"
        />
      </Block>
    </Banner>
  );
}

export default InfoBanner;
