"use client";

import type React from "react";
import { forwardRef, useRef } from "react";

import { AnimatedBeam } from "@/components/ui/animation/travelling-beams";
import { cn } from "@/lib/utils";

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function AnimatedBeams() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden bg-[#0a0a0a] p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex size-full max-h-[200px] max-w-lg flex-col  items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref} className="size-14">
            <Icons.naira />
          </Circle>
          <Circle ref={div5Ref} className="size-14">
            <Icons.agent />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref} className="size-14">
            <Icons.tricycle />
          </Circle>
          <Circle ref={div4Ref} className="size-16 bg-secondary">
            <Icons.transFlex />
          </Circle>
          <Circle ref={div6Ref} className="size-14">
            <Icons.road />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref} className="size-14">
            <Icons.bus />
          </Circle>
          <Circle ref={div7Ref} className="size-14">
            <Icons.device />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
        reverse
      />
    </div>
  );
}

const Icons = {
  tricycle: () => (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0H31C36.5228 0 41 4.47715 41 10V31C41 36.5228 36.5228 41 31 41H10C4.47715 41 0 36.5228 0 31V10Z"
        fill="#FFD60B"
      />
      <path
        d="M24.5 15.937C25.5643 16.5514 26.448 17.4352 27.0624 18.4995C27.6768 19.5638 28.0001 20.7711 28 22V30H23.83C23.6234 30.5855 23.2403 31.0926 22.7334 31.4512C22.2265 31.8099 21.6209 32.0024 21 32.0024C20.3791 32.0024 19.7735 31.8099 19.2666 31.4512C18.7597 31.0926 18.3766 30.5855 18.17 30H14V22C13.9999 20.7711 14.3232 19.5638 14.9376 18.4995C15.552 17.4352 16.4357 16.5514 17.5 15.937C17.3359 15.6418 17.2099 15.3269 17.125 15H14V13H17.126C17.3484 12.1418 17.8496 11.3817 18.5507 10.8391C19.2519 10.2965 20.1134 10.0021 21 10.0021C21.8866 10.0021 22.7481 10.2965 23.4493 10.8391C24.1504 11.3817 24.6516 12.1418 24.874 13H28V15H24.874C24.7873 15.3313 24.663 15.6437 24.501 15.937M21 23C20.7348 23 20.4804 23.1054 20.2929 23.2929C20.1054 23.4804 20 23.7348 20 24V29C20 29.2652 20.1054 29.5196 20.2929 29.7071C20.4804 29.8946 20.7348 30 21 30C21.2652 30 21.5196 29.8946 21.7071 29.7071C21.8946 29.5196 22 29.2652 22 29V24C22 23.7348 21.8946 23.4804 21.7071 23.2929C21.5196 23.1054 21.2652 23 21 23ZM21 16C21.5304 16 22.0391 15.7893 22.4142 15.4142C22.7893 15.0391 23 14.5304 23 14C23 13.4696 22.7893 12.9609 22.4142 12.5858C22.0391 12.2107 21.5304 12 21 12C20.4696 12 19.9609 12.2107 19.5858 12.5858C19.2107 12.9609 19 13.4696 19 14C19 14.5304 19.2107 15.0391 19.5858 15.4142C19.9609 15.7893 20.4696 16 21 16Z"
        fill="#0B1116"
      />
    </svg>
  ),

  transFlex: () => (
    <svg
      width="133"
      height="150"
      viewBox="0 0 133 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="132.758" height="150" fill="url(#pattern0_2001_130)" />
      <defs>
        <pattern
          id="pattern0_2001_130"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use href="#image0_2001_130" transform="scale(0.012987 0.0114943)" />
        </pattern>
        <image
          id="image0_2001_130"
          width="77"
          height="87"
          preserveAspectRatio="none"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAABXCAYAAABBRMhNAAAACXBIWXMAAAsSAAALEgHS3X78AAADb0lEQVR4nO2csW7TUBSGf1cgBEYQiYUFqbOF1HZlom8QmNhon6AgVqS2O1JaXiAdEVPYmCBdQEx4KB5YGokBCQkpQrKYkNEJ18RJnNj32L6+rs83xolz/PXY/m+SHgcZRIG7CaCT9bwLxNjxQn/V4aRKiwJ3HcAegJ2WCYsZAzgBcOx44Wh+44K0KHCfANhvqax5SN6h44VHycdnpEWB21fdJcxy4njhbvzIWkLYgQhbyk4UuL1446TT1MX+s3Wl2se244XDuNN6Taq8RuhaD0fdKc/baoHBFnVat3Fl10uXpG202QCDDZK23riy66WzZnN1tiLSGIg0BiKNgUhjINIYXNJ9ybcfl/H63Q0bai/Ms0c/WbtgSXvx6lbVx2MErjQ5PRmINAYijYFIYyDSGIg0BiKNgUhjoB1ub7p/cO/ubxtqrw36YuU9gPstPX4OQ+1OM82X8yt4++l6Je9qbO1pEhL28Pkd/AqrufReuLVn1cKKYKU0m4XBttOTZNFHT3svb1srDDZ2mu3CYJM020/JJFZU2CRhsEFa04TBhhsBBdcsYd8HX43VkwdZsDMQaQxEGgORxkCkMRBpDEQaA5HGQKQxEGkMRBoDkcZApDEQaQxEGgORxkCkMRBpDEQaA5J22riq6+WUpK0cESMs4K85XjgAsDAaRkhlRL7ia9qxOMrFxNNEmpqlI6fpavx45lDy7rkt4pbiKz8T/ktzvHCsNgytKrd+fDUuZxxXMpPTaIPjhSTusH1uUqExYFtJYVg2dA7/hjbRL777Vc/t+HB2DR/Prq58Dve3sQUgSQ9oGFPaLlaON4wCt6PEtWm0DkWw3fnuSpI5ExLtmd6XOpUvjVzSMJ2xRl23WXa1FuCr7sqVHnIv2NUO6SaR+ZdoGEfq7pg7buXutCRR4HZV1zX5dB2r7hrovpAlDdOxrv2G/l/VUAljrbnZ0mLUAM79ovsxCF3sD4q8XWFpMJjpCjJS3VV4xVOKNNif6TKzlw6lSYuxLNPlzl46lC4N9mQ6reylQyVfrFiQ6bSzlw6VdFoSw5mOnb10qFwazGW6QtlLByPSYirMdIWzlw5GpaH8TFda9tLBuDSUl+lKzV461CIthpnpKsleOtQqDdNM18t5k6DT8GlVUSIvtUuLUfIeK3nJUEyCSNYb09euVAD8BewOCMusXY7XAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  ),
  naira: () => (
    <svg
      width="43"
      height="43"
      viewBox="0 0 43 43"
      fill="#FFD60B"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.4583 28.75V15.5212C15.4582 15.24 15.5516 14.9668 15.7236 14.7444C15.8956 14.5221 16.1366 14.3631 16.4088 14.2926C16.681 14.2221 16.9688 14.2439 17.2272 14.3548C17.4856 14.4656 17.6999 14.6591 17.8363 14.9049L25.1637 28.0951C25.3001 28.3409 25.5144 28.5344 25.7728 28.6452C26.0312 28.7561 26.319 28.7779 26.5912 28.7074C26.8634 28.6369 27.1044 28.4779 27.2764 28.2556C27.4484 28.0332 27.5418 27.76 27.5417 27.4788V14.25M13.0417 19.0833H29.9583M13.0417 23.9167H29.9583M11 42H32C37.5228 42 42 37.5228 42 32V11C42 5.47715 37.5228 1 32 1H11C5.47715 1 1 5.47715 1 11V32C1 37.5228 5.47715 42 11 42Z"
        stroke="#0B1116"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bus: () => (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0H31C36.5228 0 41 4.47715 41 10V31C41 36.5228 36.5228 41 31 41H10C4.47715 41 0 36.5228 0 31V10Z"
        fill="#FFD60B"
      />
      <path
        d="M27 20H15V15H27M25.5 26C25.1022 26 24.7206 25.842 24.4393 25.5607C24.158 25.2794 24 24.8978 24 24.5C24 24.1022 24.158 23.7206 24.4393 23.4393C24.7206 23.158 25.1022 23 25.5 23C25.8978 23 26.2794 23.158 26.5607 23.4393C26.842 23.7206 27 24.1022 27 24.5C27 24.8978 26.842 25.2794 26.5607 25.5607C26.2794 25.842 25.8978 26 25.5 26ZM16.5 26C16.1022 26 15.7206 25.842 15.4393 25.5607C15.158 25.2794 15 24.8978 15 24.5C15 24.1022 15.158 23.7206 15.4393 23.4393C15.7206 23.158 16.1022 23 16.5 23C16.8978 23 17.2794 23.158 17.5607 23.4393C17.842 23.7206 18 24.1022 18 24.5C18 24.8978 17.842 25.2794 17.5607 25.5607C17.2794 25.842 16.8978 26 16.5 26ZM13 25C13 25.88 13.39 26.67 14 27.22V29C14 29.2652 14.1054 29.5196 14.2929 29.7071C14.4804 29.8946 14.7348 30 15 30H16C16.2652 30 16.5196 29.8946 16.7071 29.7071C16.8946 29.5196 17 29.2652 17 29V28H25V29C25 29.2652 25.1054 29.5196 25.2929 29.7071C25.4804 29.8946 25.7348 30 26 30H27C27.2652 30 27.5196 29.8946 27.7071 29.7071C27.8946 29.5196 28 29.2652 28 29V27.22C28.61 26.67 29 25.88 29 25V15C29 11.5 25.42 11 21 11C16.58 11 13 11.5 13 15V25Z"
        fill="#0B1116"
      />
    </svg>
  ),
  agent: () => (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0H31C36.5228 0 41 4.47715 41 10V31C41 36.5228 36.5228 41 31 41H10C4.47715 41 0 36.5228 0 31V10Z"
        fill="#FFD60B"
      />
      <path
        d="M25.5312 20.5C26.1031 20.5 26.6516 20.7272 27.056 21.1315C27.4603 21.5359 27.6875 22.0844 27.6875 22.6562V23.375C27.6875 26.2083 25.0138 29.125 20.5 29.125C15.9862 29.125 13.3125 26.2083 13.3125 23.375V22.6562C13.3125 22.0844 13.5397 21.5359 13.9441 21.1315C14.3484 20.7272 14.8969 20.5 15.4688 20.5H25.5312ZM20.5 11.1562C21.5484 11.1562 22.5539 11.5727 23.2953 12.3141C24.0366 13.0554 24.4531 14.0609 24.4531 15.1094C24.4531 16.1578 24.0366 17.1633 23.2953 17.9047C22.5539 18.646 21.5484 19.0625 20.5 19.0625C19.4516 19.0625 18.4461 18.646 17.7047 17.9047C16.9634 17.1633 16.5469 16.1578 16.5469 15.1094C16.5469 14.0609 16.9634 13.0554 17.7047 12.3141C18.4461 11.5727 19.4516 11.1562 20.5 11.1562Z"
        fill="#0B1116"
      />
    </svg>
  ),
  road: () => (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0H31C36.5228 0 41 4.47715 41 10V31C41 36.5228 36.5228 41 31 41H10C4.47715 41 0 36.5228 0 31V10Z"
        fill="#FFD60B"
      />
      <path
        d="M20 14H17.6625C16.8156 14 16.0594 14.5344 15.7781 15.3313L12.0969 25.725C12.0344 25.9062 12 26.1 12 26.2938C12 27.2344 12.7656 28 13.7063 28H20V26C20 25.4469 20.4469 25 21 25C21.5531 25 22 25.4469 22 26V28H28.2938C29.2375 28 30 27.2344 30 26.2938C30 26.1 29.9656 25.9062 29.9031 25.725L26.2219 15.3313C25.9375 14.5344 25.1844 14 24.3375 14H22V16C22 16.5531 21.5531 17 21 17C20.4469 17 20 16.5531 20 16V14ZM22 20V22C22 22.5531 21.5531 23 21 23C20.4469 23 20 22.5531 20 22V20C20 19.4469 20.4469 19 21 19C21.5531 19 22 19.4469 22 20Z"
        fill="#0B1116"
      />
    </svg>
  ),
  device: () => (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10C0 4.47715 4.47715 0 10 0H31C36.5228 0 41 4.47715 41 10V31C41 36.5228 36.5228 41 31 41H10C4.47715 41 0 36.5228 0 31V10Z"
        fill="#FFD60B"
      />
      <path
        d="M16.125 11C14.7461 11 13.625 12.1211 13.625 13.5V28.5C13.625 29.8789 14.7461 31 16.125 31H24.875C26.2539 31 27.375 29.8789 27.375 28.5V13.5C27.375 12.1211 26.2539 11 24.875 11H16.125ZM19.25 27.875H21.75C22.0938 27.875 22.375 28.1562 22.375 28.5C22.375 28.8438 22.0938 29.125 21.75 29.125H19.25C18.9062 29.125 18.625 28.8438 18.625 28.5C18.625 28.1562 18.9062 27.875 19.25 27.875Z"
        fill="#0B1116"
      />
    </svg>
  ),
};
