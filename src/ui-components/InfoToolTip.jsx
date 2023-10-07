import { StatefulTooltip, PLACEMENT } from "baseui/tooltip";
import { Block } from "baseui/block";

function InfoIcon({ iconSize }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "5px",
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <path
          fill="#000000"
          fillRule="evenodd"
          d="M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z"
        />
      </svg>
    </div>
  );
}

function InfoToolTip({ infoToolTipContent }) {
  const iconSize = "16px";

  return (
    <StatefulTooltip
      content={() => (
        <Block width="300px">
          {infoToolTipContent.map((text, i) => (
            <p key={i}>{text}</p>
          ))}
        </Block>
      )}
      placement={PLACEMENT.top}
      showArrow
      returnFocus
      autoFocus
    >
      <Block display="flex">
        <InfoIcon iconSize={iconSize} />
      </Block>
    </StatefulTooltip>
  );
}

export default InfoToolTip;
