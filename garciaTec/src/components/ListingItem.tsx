type ListingItemProps = {
    id: number;
    imageSrc?: string;
    title?: string;
    label?: string;
    price?: string;
    description?: string;
    checked?: boolean;
    onCheckboxChange?: (id: number, checked: boolean) => void;
  };

const ListingItem = ({
    id,
    imageSrc = "",
    description = "",
    title = "Product Title",
    label = "Label",
    price = "$99",
    checked = false,
    onCheckboxChange,
  }: ListingItemProps) => {
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckboxChange?.(id, e.target.checked);
    };
  return (
    <div className={`p-4 m-0 border-8 text-2xl min-w-fit flex justify-center items-center w-85 border-primaryBrown-900`}>
      <div className='flex flex-col gap-5 items-baseline justify-baseline'>
          <label className="relative inline-block w-full h-[1.6em] mr-[0.5em]">
            <input
              type="checkbox"
              checked={checked}
              onChange={handleCheckboxChange}
              className="peer appearance-none w-full h-full border-[0.15em] border-amber-800 rounded-[0.15em] outline-none cursor-pointer checked:bg-amber-800"
            />
            <svg
              className="absolute top-1/2 left-1/2 w-[1em] h-[1em] text-white transform -translate-x-1/2 -translate-y-1/2 hidden peer-checked:block pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
            <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="absolute top-1/2 left-1/2 text-[0.7em] text-amber-800 font-semibold transform -translate-x-1/2 -translate-y-1/2 peer-checked:hidden pointer-events-none font-press">
    SELECIONAR
  </span>
        </label>
        <div className={`h-fit w-65 bg-offWhite-200 flex items-center justify-center`}>
          {imageSrc? <img src={imageSrc} alt={title} className='max-w-fit object-contain'/> : null}
        </div>
      <div className='text-neutral-900 font-[500] text-md'>{title}</div>
      <div className='text-neutral-700 font-[500] text-sm'>{description}</div>
      <div className='flex gap-6 items-center'>
        <div className='px-4 py-1 rounded-2xl text-green-500 text-[0.8em] font-[900] uppercase'>{label}</div>
        <div className='text-neutral-600'>{price}</div>
      </div>
    </div>
  </div>
);
};

export default ListingItem;
