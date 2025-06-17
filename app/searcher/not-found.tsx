import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

const NotFound = () => {
	return (
		<section className='max-w-lg mx-auto flex gap-10 flex-col items-center justify-center h-screen'>
			<Link
				href='/'
				className='h-16'
			>
				<Image
					className='object-contain h-full w-full dark:invert'
					src={'/logo.png'}
					alt=''
					width={400}
					height={400}
				/>
			</Link>
			<div className='flex flex-col gap-5'>
				<h3 className='uppercase text-center'>Vehicle not found</h3>
				<span className='text-center'>No vehicle found.</span>

				<div className='h-96 aspect-square mx-auto'>
					{/* <Jap animation='/animations/1.json' /> */}
					<Image alt="not fine" src={'/animations/a.gif'} className='h-full w-full object-contain' height={50} width={50} />
				</div>
				<div className='flex flex-col gap-3 uppercase'>
					<Button asChild>
						<Link
							className=''
							href={'/dashboard'}
						>
							Go To Dashboard
						</Link>
					</Button>
				</div>
			</div>
		</section>
	);
};

export default NotFound;
