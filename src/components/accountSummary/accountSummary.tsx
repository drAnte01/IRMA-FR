import style from "../../styles/components/accountSummary.module.css";

type Props = {
    daily: number | null;
    yesterday?: number | null;
    weekly: number | null;
    monthly: number | null;
    show?: {
        daily?: boolean;
        yesterday?: boolean;
        weekly?: boolean;
        monthly?: boolean;
    };
};

function AccountSummary({ daily, yesterday = null, weekly, monthly, show }: Props) {
    const formatAmount = (value: number | null): string => (value !== null ? value.toFixed(2) : "0.00");

    return (
        <>
            <div className={style.accountSummary}>

                {/* Naziv restorana */}
                <h1 className={style.restaurantName}>Restaurant Name</h1>

                {/* Statistika po periodima */}
                <div className={style.periodicStats}>

                    {show?.daily && (
                        <div className={style.statCard}>
                            <span className={style.label}>Today</span>
                            <span className={style.amount}>€ {formatAmount(daily)}</span>
                        </div>
                    )}

                    {show?.yesterday && (
                        <div className={style.statCard}>
                            <span className={style.label}>Yesterday</span>
                            <span className={style.amount}>€ {formatAmount(yesterday)}</span>
                        </div>
                    )}

                    {show?.weekly && (
                        <div className={style.statCard}>
                            <span className={style.label}>This Week</span>
                            <span className={style.amount}>€ {formatAmount(weekly)}</span>
                        </div>
                    )}

                    {show?.monthly && (
                        <div className={style.statCard}>
                            <span className={style.label}>This Month</span>
                            <span className={style.amount}>€ {formatAmount(monthly)}</span>
                        </div>
                    )}

                </div>

            </div>
        </>
    );
}

export default AccountSummary;