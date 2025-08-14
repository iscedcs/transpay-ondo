"use client"; // Error components must be Client Components

import { buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { MailIcon, PhoneCall } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export default function Error({
     error,
     reset,
}: {
     error: Error & { digest?: string };
     reset: () => void;
}) {
     useEffect(() => {}, [error]);

     return (
          <>
               <div className="mx-auto grid h-[100svh] w-full max-w-2xl place-items-center p-4 text-center">
                    <div className="flex flex-col items-center justify-center">
                         <h1 className="text-2xl font-bold">
                              Oops! Something Went Wrong!
                         </h1>
                         {/* [Image: A friendly illustration or graphic] */}
                         <div className="mx-auto aspect-video w-full">
                              {/* <Jap animation="/animations/1.json" /> */}
                              <Image alt="not fine" src={'/animations/a.gif'} className='h-full w-full object-contain' height={50} width={50} />
                         </div>
                         <div className="mb-5">
                              {`Don't worry; we're on it!`}
                         </div>
                         <h2 className="text-xl font-bold">What You Can Do</h2>
                         <ol className="mb-5 text-start">
                              <li>
                                   <span className="font-bold">
                                        Try Again:{" "}
                                   </span>
                                   {/* <span>
								Give it another shot by refreshing the
								page. Sometimes, a simple reload does
								the trick
							</span>{' '} */}
                                   <button
                                        onClick={
                                             // Attempt to recover by trying to re-render the segment
                                             () => reset()
                                        }
                                        className="cursor-pointer text-primary underline"
                                   >
                                        Click Here To Reload Page
                                   </button>
                              </li>
                              <li>
                                   <span className="font-bold">
                                        Check Your Internet Connection:{" "}
                                   </span>
                                   {/* <span>
								Ensure you have a stable internet
								connection. A momentary glitch might be
								causing the issue.
							</span>{' '} */}
                              </li>
                              {/* <li>
							<span className='font-bold'>
								Explore Other Areas:{' '}
							</span>
							<span>
								While we fix this, why not explore other
								parts of TransPay? You might discover
								something new and interesting.
							</span>{' '}
						</li> */}
                         </ol>
                         <h2 className="text-xl font-bold">Need Assistance?</h2>
                         {/* <div className='mb-2'>
						If the issue persists or if you have any
						questions, our friendly support team is here to
						help. Feel free to contact us
					</div> */}
                         <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
                              {/* <Link
							href={'/#'}
							className={cn(buttonVariants(), 'gap-2')}
						>
							<FacebookIcon /> Facebook
						</Link>
						<Link
							href={'/#'}
							className={cn(buttonVariants(), 'gap-2')}
						>
							<InstagramIcon /> Instagram
						</Link> */}
                              <a
                                   href={"sms:+2348163453826"}
                                   className={cn(buttonVariants(), "gap-2")}
                              >
                                   <MailIcon /> SMS
                              </a>
                              <a
                                   href={"tel:+2348163453826"}
                                   className={cn(buttonVariants(), "gap-2")}
                              >
                                   <PhoneCall /> Call
                              </a>
                              <a
                                   href={"whatsapp://send?phone=2348163453826"}
                                   className={cn(buttonVariants(), "gap-2")}
                              >
                                   <WhatsAppIcon /> WhatsApp
                              </a>
                         </div>
                         <div className="">
                              We appreciate your cooperation as we work to make
                              your TransPay experience even better!
                         </div>
                    </div>
               </div>
          </>
     );
}
