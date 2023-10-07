import { Banner } from "baseui/banner";
import { Block } from "baseui/block";
import InfoItem from "./InfoItem";

function InfoBanner({ generationNum, timeRemaining, totalTime }) {
  function formatSecondsToTimeString(seconds) {
    let minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    if (minutes == 0) {
      return `${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
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
          value={formatSecondsToTimeString(timeRemaining)}
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
