
const routeGroups = [
  {
    title: 'FROM NAIROBI',
    routes: ['Kampala', 'Mombasa', 'Dar el salaam'],
  },
  {
    title: 'FROM MOMBASA',
    routes: ['Dar el salaam', 'Malaba', 'Kitale'],
  },
];

export default function RoutesSection() {
  return (
    <section className="w-full bg-white pb-[35px] max-md:pb-[13px]">
      <div className="mx-auto w-[min(1140px,calc(100%-32px))] max-md:w-[calc(100%-12px)]">
        <div
          className="
            w-full
            rounded-[12px]
            border border-[#dedede]
            bg-[#f9f9f9]
            px-[25px]
            pt-[18px]
            pb-[19px]
          "
        >
          {/* Section heading */}
          <h2 className="mb-[19px] text-[16px] font-semibold leading-[20px] text-[#111111]">
            Our top routes
          </h2>

          {/* Routes in two columns */}
          <div className="grid grid-cols-2 gap-x-[20px]">
            {routeGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-[9px] text-[12px] font-semibold leading-[15px] text-[#ff1818]">
                  {group.title}
                </h3>

                <ul className="flex flex-col gap-[7px]">
                  {group.routes.map((route) => (
                    <li
                      key={route}
                      className="flex min-h-[15px] items-center gap-[7px]"
                    >
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="shrink-0"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 2.5L7.5 6L4 9.5"
                          stroke="#bcbcbc"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      <span className="text-[11px] font-normal leading-[15px] text-[#333333]">
                        {route}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
