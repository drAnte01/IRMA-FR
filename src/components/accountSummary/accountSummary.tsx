import style from "../../styles/components/accountSummary.module.css";

type Props = {
    daily: number | null;
    weekly: number | null;
    monthly: number | null;
     show?: {
        daily?: boolean;
        weekly?: boolean;
        monthly?: boolean;
    };
};

function AccountSummary({ daily, weekly, monthly, show }: Props) {
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
                            <span className={style.amount}>€ {daily?.toFixed(2)}</span>
                        </div>
                    )}

                    {show?.weekly && (
                        <div className={style.statCard}>
                            <span className={style.label}>This Week</span>
                            <span className={style.amount}>€ {weekly?.toFixed(2)}</span>
                        </div>
                    )}

                    {show?.monthly && (
                        <div className={style.statCard}>
                            <span className={style.label}>This Month</span>
                            <span className={style.amount}>€ {monthly?.toFixed(2)}</span>
                        </div>
                    )}

                </div>

            </div>
        </>
    );
}

export default AccountSummary;