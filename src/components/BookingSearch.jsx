import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { towns } from '../data/siteData';

function toInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function fromInputDate(value) {
  return new Date(`${value}T00:00:00`);
}

function addDays(value, days) {
  const date = typeof value === 'string' ? fromInputDate(value) : new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function readableDate(value) {
  if (!value) return '';

  const date = fromInputDate(value);

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function monthLabel(date) {
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });
}

function isBeforeDate(a, b) {
  return fromInputDate(a) < fromInputDate(b);
}

function sameDate(a, b) {
  return a === b;
}

const today = toInputDate(new Date());

function BusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full fill-current">
      <path d="M6 3h12c1.7 0 3 1.3 3 3v10c0 .9-.6 1.7-1.4 1.9V20c0 .6-.4 1-1 1h-1.4c-.6 0-1-.4-1-1v-2H7.8v2c0 .6-.4 1-1 1H5.4c-.6 0-1-.4-1-1v-2.1C3.6 17.7 3 16.9 3 16V6c0-1.7 1.3-3 3-3Zm0 2c-.6 0-1 .4-1 1v4h14V6c0-.6-.4-1-1-1H6Zm-.5 9.5A1.5 1.5 0 1 0 8.5 14.5a1.5 1.5 0 0 0-3 0Zm10 0a1.5 1.5 0 1 0 3.001-.001A1.5 1.5 0 0 0 15.5 14.5ZM5 16h14v-4H5v4Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full fill-current">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full fill-current">
      <path d="M7 2h2v3h6V2h2v3h2.5A2.5 2.5 0 0 1 22 7.5v11A2.5 2.5 0 0 1 19.5 21h-15A2.5 2.5 0 0 1 2 18.5v-11A2.5 2.5 0 0 1 4.5 5H7V2Zm13 8H4v8.5c0 .3.2.5.5.5h15c.3 0 .5-.2.5-.5V10ZM4.5 7c-.3 0-.5.2-.5.5V8h16v-.5c0-.3-.2-.5-.5-.5h-15Z" />
    </svg>
  );
}

export default function BookingSearch() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState('one-way');

  const [form, setForm] = useState({
    from: '',
    to: '',
    passengers: 1,
    date: '',
    returnDate: '',
  });

  const [locationText, setLocationText] = useState({ from: '', to: '' });
  const [openCalendar, setOpenCalendar] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(fromInputDate(today));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const destinationOptions = useMemo(
    () => towns.filter((town) => town !== form.from),
    [form.from]
  );

  const minimumReturnDate = form.date ? toInputDate(addDays(form.date, 1)) : today;

  // Typed text is kept separate from the validated town selection. A traveller
  // must select a real matching place before searching; partial text is not sent
  // to the API as a location.
  function typeLocation(name, text) {
    setLocationText((current) => ({ ...current, [name]: text }));
    setForm((current) => ({ ...current, [name]: '' }));
    setError('');
  }

  function chooseLocation(name, town) {
    const clearDestination = name === 'from' && form.to === town;
    setLocationText((current) => ({
      ...current,
      [name]: town,
      ...(clearDestination ? { to: '' } : {}),
    }));
    setForm((current) => ({
      ...current,
      [name]: town,
      ...(clearDestination ? { to: '' } : {}),
    }));
    setError('');
  }

  function handleTripTypeChange(value) {
    setTripType(value);
    setError('');
    setOpenCalendar(null);

    setForm((current) => ({
      ...current,
      returnDate: value === 'round-trip' ? current.returnDate : '',
    }));
  }

  function openDatePicker(type) {
    setError('');

    if (type === 'return' && !form.date) {
      setError('Select your travel date first.');
      return;
    }

    const currentValue =
      type === 'travel'
        ? form.date || today
        : form.returnDate || minimumReturnDate;

    setCalendarMonth(fromInputDate(currentValue));
    setOpenCalendar(type);
  }

  function handleDateSelect(type, value) {
    setForm((current) => {
      if (type === 'travel') {
        return {
          ...current,
          date: value,
          returnDate:
            current.returnDate && current.returnDate > value
              ? current.returnDate
              : '',
        };
      }

      return {
        ...current,
        returnDate: value,
      };
    });

    setError('');
    setOpenCalendar(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.from || !form.to || form.from === form.to) {
      setError('Type a location and select a matching suggestion for both From and To.');
      return;
    }

    if (!form.date) {
      setError('Select your travel date.');
      return;
    }

    if (tripType === 'round-trip' && !form.returnDate) {
      setError('Select a return date for your round trip.');
      return;
    }

    if (tripType === 'round-trip' && form.returnDate <= form.date) {
      setError('Return date must be at least one day after travel date.');
      return;
    }

    const payload = {
      ...form,
      tripType,
      returnDate: tripType === 'round-trip' ? form.returnDate : '',
    };

    setLoading(true);
    const params = new URLSearchParams(payload);
    navigate(`/booking/results?${params.toString()}`);
  }


  return (
    <section
      aria-label="Book your next bus ticket"
      className="relative w-full overflow-visible rounded-[14px] bg-[#fff7f2] shadow-[0_10px_35px_rgba(255,91,0,0.10)]"
    >
      <div className="grid grid-cols-[1fr_auto] items-start gap-2 px-3 pb-2 pt-4 md:flex md:h-[52px] md:items-center md:justify-between md:px-4 md:py-0">
        <div className="flex items-center gap-[17px] md:gap-[28px]">
          <TripRadio
            label="One Way"
            value="one-way"
            checked={tripType === 'one-way'}
            onChange={() => handleTripTypeChange('one-way')}
          />

          <TripRadio
            label="Round Trip"
            value="round-trip"
            checked={tripType === 'round-trip'}
            onChange={() => handleTripTypeChange('round-trip')}
          />
        </div>

        <div className="grid max-w-[210px] grid-cols-[1fr_auto] items-start gap-2 text-left text-[11px] font-bold leading-[1.45] text-[#5c5f66] md:flex md:max-w-none md:items-center md:gap-2 md:text-[14px]">
          <span className="max-w-[100px] md:max-w-none">Book your next ticket using</span>

          <img 
          src="/assets/Travellerlogo.svg" 
          alt="traveller logo" 
          className="-mt-1 h-[30px] w-auto object-contain md:mt-0 md:h-[32px]"/>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`
          grid grid-cols-1 gap-[7px] px-2 pb-2
          ${tripType === 'one-way' ? 'md:grid-cols-[1.15fr_1.15fr_1fr_auto]' : 'md:grid-cols-[1.15fr_1.15fr_1fr_1fr_auto]'} md:gap-0 md:rounded-[12px] md:border md:border-[#d8dce1] md:bg-white md:p-0
        `}
      >
        <BookingLocationField
          label="From"
          icon={<BusIcon />}
          name="from"
          query={locationText.from}
          selected={form.from}
          placeholder="Search departure"
          options={towns}
          onInput={(text) => typeLocation('from', text)}
          onSelect={(town) => chooseLocation('from', town)}
        />

        <BookingLocationField
          label="To"
          icon={<PinIcon />}
          name="to"
          query={locationText.to}
          selected={form.to}
          placeholder="Search destination"
          options={destinationOptions}
          onInput={(text) => typeLocation('to', text)}
          onSelect={(town) => chooseLocation('to', town)}
        />

        <DateDisplayField
          label="Travel Date"
          helper="Today Tom"
          icon={<CalendarIcon />}
          value={form.date}
          placeholder="Travel Date"
          onClick={() => openDatePicker('travel')}
        />

        {tripType === 'round-trip' && (
          <DateDisplayField
            label="Return Date"
            icon={<CalendarIcon />}
            value={form.returnDate}
            placeholder="Return Date"
            onClick={() => openDatePicker('return')}
          />
        )}

        <div className="md:flex md:items-center md:justify-center md:px-3">
          <button
            type="submit"
            disabled={loading}
            className="
              mt-2 h-[51px] w-full rounded-full bg-[#ff8b50] text-[13px] font-extrabold uppercase text-[#334155] transition
              hover:bg-[#ff7a33] disabled:cursor-not-allowed disabled:opacity-70
              md:mt-0 md:h-[47px] md:w-[140px] md:text-[13px]
            "
          >
            {loading ? 'Searching...' : 'Search Bus'}
          </button>
        </div>
      </form>

      {openCalendar && (
        <>
          <button
            type="button"
            aria-label="Close calendar"
            className="fixed inset-0 z-30 cursor-default bg-transparent"
            onClick={() => setOpenCalendar(null)}
          />

          <CalendarPopover
            value={openCalendar === 'travel' ? form.date : form.returnDate}
            minDate={openCalendar === 'travel' ? today : minimumReturnDate}
            month={calendarMonth}
            setMonth={setCalendarMonth}
            onSelect={(value) => handleDateSelect(openCalendar, value)}
            align={openCalendar === 'travel' ? 'travel' : 'return'}
          />
        </>
      )}

      {error && (
        <p className="px-4 pb-3 pt-2 text-[13px] font-semibold text-red-600">
          {error}
        </p>
      )}


    </section>
  );
}

function TripRadio({ label, value, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-[5px] text-[12px] font-bold text-[#5f6875]">
      <input
        type="radio"
        name="tripType"
        value={value}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className="
          grid h-[17px] w-[17px] place-items-center rounded-full border border-[#c8d7e5] bg-white
          peer-checked:border-[#f05a00] peer-checked:bg-[#f05a00]
          after:hidden after:h-[7px] after:w-[7px] after:rounded-full after:bg-white peer-checked:after:block
        "
      />
      {label}
    </label>
  );
}

/**
 * Searchable location combobox. A user types a town name, then chooses a
 * matching destination. The full supplied route catalogue is searchable;
 * the results panel is height-limited without cutting off matching items.
 */
function BookingLocationField({
  label,
  icon,
  name,
  query,
  selected,
  placeholder,
  options,
  onInput,
  onSelect,
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const fieldRef = useRef(null);
  const inputRef = useRef(null);
  const inputId = useId();
  const listId = useId();

  const search = query.trim().toLocaleLowerCase();
  const matches = useMemo(() => {
    if (!search) return [];
    return options.filter((town) => town.toLocaleLowerCase().includes(search))
      .sort((a, b) => {
        // Prefix matches first, followed by substring matches in A-Z order.
        const ap = a.toLocaleLowerCase().startsWith(search);
        const bp = b.toLocaleLowerCase().startsWith(search);
        return ap === bp ? a.localeCompare(b) : ap ? -1 : 1;
      });
  }, [options, search]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!fieldRef.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(0);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, []);

  function pick(town) {
    onSelect(town);
    setActiveIndex(0);
    setOpen(false);
  }

  function handleKeys(event) {
    if (event.key === 'Escape') {
      if (open) event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!matches.length) return;
      setActiveIndex((index) => event.key === 'ArrowDown'
        ? Math.min(index + 1, matches.length - 1)
        : Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter' && open && matches.length) {
      // Choosing an option must not submit the whole booking form.
      event.preventDefault();
      pick(matches[Math.min(activeIndex, matches.length - 1)]);
    }
  }

  const showMatches = open && !!search;

  return (
    <div
      ref={fieldRef}
      className={`relative min-h-[69px] rounded-[6px] border border-[#ff9b6a] bg-white md:min-h-[70px] md:rounded-none md:border-0 md:border-r md:border-[#e5e7eb] ${open ? 'z-20' : 'z-0'}`}
    >
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-2 top-3 z-[2] text-[11px] font-semibold text-[#20242a] md:left-[50px] md:top-[18px] md:font-extrabold md:uppercase md:leading-none md:text-[#555b63]"
      >
        {label}
      </label>
      <i className="pointer-events-none absolute bottom-[17px] left-[10px] z-[2] flex h-[18px] w-[18px] text-[#606977] md:bottom-[24px] md:left-[22px]">
        {icon}
      </i>
      <input
        id={inputId}
        ref={inputRef}
        name={name}
        type="text"
        autoComplete="off"
        autoCapitalize="words"
        spellCheck={false}
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onInput(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onKeyDown={handleKeys}
        placeholder={placeholder}
        required
        aria-label={`${label} location`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showMatches}
        aria-controls={showMatches ? listId : undefined}
        aria-activedescendant={showMatches && matches.length ? `${listId}-option-${activeIndex}` : undefined}
        className={`absolute inset-0 z-[1] h-full w-full rounded-[6px] bg-transparent pb-[10px] pl-[40px] pr-9 pt-[27px] text-[14px] font-bold outline-none placeholder:text-[#8793a3] focus-visible:ring-2 focus-visible:ring-[#ff6408] md:rounded-none md:pb-[12px] md:pl-[50px] md:pt-[30px] md:text-[16px] ${selected ? 'text-[#111]' : 'text-[#425166]'}`}
      />
      <svg
        className="pointer-events-none absolute bottom-[20px] right-[10px] z-[2] h-4 w-4 text-[#687385] md:bottom-[24px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </svg>

      {showMatches && (
        <div
          id={listId}
          role="listbox"
          aria-label={`${label} matching locations`}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[60] max-h-[265px] overflow-y-auto overscroll-contain rounded-[10px] border border-[#e5e7eb] bg-white py-1 shadow-[0_12px_35px_rgba(0,0,0,0.20)] md:min-w-[235px]"
        >
          {matches.length ? matches.map((town, index) => (
            <button
              key={town}
              id={`${listId}-option-${index}`}
              type="button"
              role="option"
              aria-selected={selected === town}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => pick(town)}
              className={`block w-full px-4 py-[10px] text-left text-[13px] font-semibold transition md:text-[14px] ${index === activeIndex ? 'bg-[#fff0e5] text-[#e55e00]' : 'text-[#334155] hover:bg-[#fff7f2]'}`}
            >
              {town}
            </button>
          )) : (
            <p className="px-4 py-3 text-[13px] text-[#64748b]">No matching locations. Check the spelling.</p>
          )}
        </div>
      )}
    </div>
  );
}

function DateDisplayField({
  label,
  helper,
  icon,
  value,
  placeholder,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative min-h-[69px] rounded-[6px] border border-[#ff9b6a] bg-white text-left
        md:min-h-[70px] md:rounded-none md:border-0 md:border-r md:border-[#e5e7eb]
      "
    >
      <span
        className="
          absolute left-2 top-3 z-[2] flex items-center gap-[5px]
          text-[11px] font-semibold leading-none text-[#20242a]
          md:left-[42px] md:top-[19px] md:text-[11px] md:font-extrabold md:uppercase md:text-[#555b63]
        "
      >
        <span>{label}</span>

        {helper && (
          <b className="hidden text-[14px] font-extrabold normal-case leading-none text-black md:inline-block">
            {helper}
          </b>
        )}
      </span>

      <i
        className="
          absolute bottom-[18px] left-[10px] z-[2] flex h-[18px] w-[18px] text-[#606977]
          md:bottom-[24px] md:left-[17px] md:h-[18px] md:w-[18px]
        "
      >
        {icon}
      </i>

      <strong
        className={`
          pointer-events-none absolute bottom-[16px] left-[40px] z-[2]
          text-[14px] font-extrabold leading-none
          md:bottom-[18px] md:left-[42px] md:text-[16px] md:leading-none
          ${value ? 'text-[#111111]' : 'text-[#65748a] md:text-[#aab2bd]'}
        `}
      >
        {value ? readableDate(value) : placeholder}
      </strong>
    </button>
  );
}

function CalendarPopover({ value, minDate, month, setMonth, onSelect, align }) {
  const days = buildCalendarDays(month);
  const selectedValue = value;
  const minValue = minDate || today;

  function previousMonth() {
    const next = new Date(month);
    next.setMonth(next.getMonth() - 1);
    setMonth(next);
  }

  function nextMonth() {
    const next = new Date(month);
    next.setMonth(next.getMonth() + 1);
    setMonth(next);
  }

  return (
    <div
      className={`
        absolute z-40 w-[268px] rounded-[5px] bg-white px-[10px] pb-[12px] pt-[11px]
        shadow-[0_3px_12px_rgba(0,0,0,0.22)]
        max-md:left-1/2 max-md:top-[22px] max-md:w-[calc(100%-32px)] max-md:-translate-x-1/2 max-md:px-[10px] max-md:pb-[13px]
        ${
          align === 'return'
            ? 'right-[70px] top-[60px] md:right-[70px] md:top-[60px]'
            : 'right-[250px] top-[60px] md:right-[250px] md:top-[60px]'
        }
      `}
    >
      <div className="mb-[13px] flex h-[31px] items-center justify-between border-b border-[#dce3eb] pb-[10px]">
        <button
          type="button"
          onClick={previousMonth}
          className="grid h-[26px] w-[26px] place-items-center rounded-full text-[22px] leading-none text-[#50627a] hover:bg-[#edf2f7]"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="text-[14px] font-medium text-[#26354a]">
          {monthLabel(month)}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="grid h-[26px] w-[26px] place-items-center rounded-full text-[22px] leading-none text-[#50627a] hover:bg-[#edf2f7]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[13px] font-medium text-[#26354a]">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="h-[26px]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center text-[14px] text-[#26354a]">
        {days.map((day) => {
          const disabled = isBeforeDate(day.value, minValue);
          const active = selectedValue && sameDate(day.value, selectedValue);
          const todayActive = sameDate(day.value, today);

          return (
            <button
              key={day.value}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(day.value)}
              className={`
                mx-auto grid h-[34px] w-[34px] place-items-center rounded-full text-[14px] transition
                ${day.inCurrentMonth ? 'text-[#26354a]' : 'text-[#8793a3]'}
                ${disabled ? 'cursor-not-allowed opacity-35' : 'hover:bg-[#edf2f7]'}
                ${todayActive && !active ? 'bg-[#edf2f7]' : ''}
                ${active ? 'bg-[#ff6408] font-bold text-white hover:bg-[#ff6408]' : ''}
              `}
            >
              {day.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      value: toInputDate(date),
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === month,
    };
  });
}