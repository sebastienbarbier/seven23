import TrendsComponent from "./TrendsComponent";

import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import pagination from "../swiper/Pagination";

export default function Trends({ isLoading, trend7, trend30, onOpenTrend }) {
  return (
    <Swiper
      className="mobileSwiperStyle"
      pagination={pagination}
      module={[Pagination]}
      slidesPerView={"auto"}
      spaceBetween={10}
    >
      <SwiperSlide>
        <TrendsComponent
          label="30"
          isLoading={isLoading}
          trend={trend30}
          onOpenTrend={onOpenTrend}
        />
      </SwiperSlide>

      <SwiperSlide>
        <TrendsComponent
          label="7"
          isLoading={isLoading}
          trend={trend7}
          onOpenTrend={onOpenTrend}
        />
      </SwiperSlide>
    </Swiper>
  );
}
