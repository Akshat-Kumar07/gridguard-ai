from app.simulator.registry_generator import generate_registry
from app.simulator.fault_injector import (
    inject_span_fault,
    inject_dt_fault,
    inject_feeder_fault
)
from app.simulator.noise_generator import inject_noise
from app.simulator.repair import repair_fault
from app.simulator.noise import inject_noise

def menu():

    while True:

        print("\n==============================")
        print(" GRIDGUARD FAULT SIMULATOR ")
        print("==============================")

        print("1. Generate Registry")
        print("2. Inject Span Fault")
        print("3. Inject DT Fault")
        print("4. Inject Feeder Fault")
        print("5. Inject Noise")
        print("6. Repair Fault")
        print("7. Exit")

        choice = input("\nEnter Choice: ").strip()

        print(f"Choice = {choice}")

        if choice == "1":
            print("Matched 1")
            generate_registry()

        elif choice == "2":
            print("Matched 2")
            inject_span_fault()

        elif choice == "3":
            print("Matched 3")
            inject_dt_fault()

        elif choice == "4":
            print("Matched 4")
            inject_feeder_fault()

        elif choice == "5":
            print("Matched 5")
            inject_noise()

        elif choice == "6":
            print("Matched 6")
            repair_fault()

        elif choice == "7":
            print("Matched 7")
            break

        else:
            print("Invalid Choice")

if __name__ == "__main__":
    menu()